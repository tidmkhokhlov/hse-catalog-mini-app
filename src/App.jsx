import React, { useState, useEffect } from "react";

// Обновлённая версия мини-приложения «Поступи в Вышку» (только UI)
// — без встроенного чат-бота; теперь бот живёт в MAX чате
// — добавлена кнопка "Спросить бота в чате" с deep-link max://bot?text=...

const MOCK_PROGRAMS = [
    {
        id: "hse-nn-1",
        name: "Программная инженерия",
        faculty: "Факультет компьютерных наук",
        subjects: ["Русский", "Математика (проф.)", "Информатика"],
        min_score: 265,
        form: "Очная",
        paid: false,
        url: "https://nnov.hse.ru/programs/progeng",
        admission_deadline: "2025-07-25",
        description:
            "Программа о создании и сопровождении распределённых систем и приложений. Подходит для тех, кто любит программировать и проектировать ПО.",
    },
    {
        id: "hse-nn-2",
        name: "Бизнес-информатика",
        faculty: "Факультет экономики и менеджмента",
        subjects: ["Русский", "Математика (проф.)", "Информатика/Общество"],
        min_score: 256,
        form: "Очная",
        paid: false,
        url: "https://nnov.hse.ru/programs/bizinf",
        admission_deadline: "2025-07-25",
        description:
            "Сочетание экономики и цифровых технологий. Анализ данных, автоматизация бизнес-процессов.",
    },
    {
        id: "hse-nn-3",
        name: "Экономика",
        faculty: "Факультет экономических наук",
        subjects: ["Русский", "Математика", "Обществознание"],
        min_score: 270,
        form: "Очная",
        paid: false,
        url: "https://nnov.hse.ru/programs/economics",
        admission_deadline: "2025-07-25",
        description: "Традиционная программа по экономической теории и практике.",
    },
];

export default function MiniApp() {
    const [programs] = useState(MOCK_PROGRAMS);
    const [query, setQuery] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("Все факультеты");
    const [selected, setSelected] = useState(null);
    const [favorites, setFavorites] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("pvf_favorites")) || [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("pvf_favorites", JSON.stringify(favorites));
    }, [favorites]);

    const faculties = ["Все факультеты", ...new Set(programs.map((p) => p.faculty))];

    function searchAndFilter() {
        const q = query.trim().toLowerCase();
        return programs.filter((p) => {
            if (facultyFilter !== "Все факультеты" && p.faculty !== facultyFilter) return false;
            if (!q) return true;
            return (
                p.name.toLowerCase().includes(q) ||
                p.faculty.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
            );
        });
    }

    function toggleFavorite(program) {
        setFavorites((prev) => {
            const exists = prev.find((p) => p.id === program.id);
            if (exists) return prev.filter((p) => p.id !== program.id);
            return [...prev, program];
        });
    }

    function openProgram(program) {
        setSelected(program);
    }

    function exportChecklist(program) {
        const lines = [];
        lines.push(`Чек-лист для программы: ${program.name}`);
        lines.push(`Факультет: ${program.faculty}`);
        lines.push(`Форма: ${program.form}`);
        lines.push(`Предметы: ${program.subjects.join(", ")}`);
        lines.push(`Крайний срок подачи: ${program.admission_deadline}`);
        lines.push("\nШаги:");
        lines.push("1. Подготовить документы.");
        lines.push("2. Сдать ЕГЭ по нужным предметам.");
        lines.push("3. Подать заявление через admission.hse.ru.");

        const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${program.id}_checklist.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="p-4 min-h-screen bg-gray-50 text-gray-800">
            <header className="max-w-5xl mx-auto mb-6">
                <h1 className="text-2xl font-semibold">Поступи в Вышку — ВШЭ НН</h1>
                <p className="mt-2 text-sm text-gray-600">Каталог направлений. Для вопросов — используйте чат-бота в MAX.</p>
            </header>

            <main className="max-w-5xl mx-auto grid grid-cols-12 gap-6">
                <section className="col-span-8">
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex gap-3">
                            <input
                                className="flex-1 p-3 border rounded-lg focus:outline-none"
                                placeholder="Поиск программ, например: информатика, экономика..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <select
                                className="p-3 border rounded-lg"
                                value={facultyFilter}
                                onChange={(e) => setFacultyFilter(e.target.value)}
                            >
                                {faculties.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3">
                            {searchAndFilter().length === 0 ? (
                                <div className="text-sm text-gray-500 p-6 text-center">Ничего не найдено.</div>
                            ) : (
                                searchAndFilter().map((p) => (
                                    <article
                                        key={p.id}
                                        className="p-4 border rounded-xl hover:shadow-md transition cursor-pointer flex justify-between items-center"
                                        onClick={() => openProgram(p)}
                                    >
                                        <div>
                                            <div className="font-medium">{p.name}</div>
                                            <div className="text-sm text-gray-600">{p.faculty} · {p.form}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm text-gray-700">{p.min_score}</div>
                                            <button
                                                className={`p-2 rounded-md ${favorites.find(f=>f.id===p.id)?'bg-yellow-200':'bg-gray-100'}`}
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}
                                            >⭐</button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <aside className="col-span-4 space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                        {selected ? (
                            <div>
                                <h2 className="text-lg font-semibold">{selected.name}</h2>
                                <div className="text-sm text-gray-600">{selected.faculty} · {selected.form}</div>
                                <p className="mt-3 text-sm text-gray-700">{selected.description}</p>
                                <div className="mt-3 text-sm text-gray-600">
                                    <div>Предметы: {selected.subjects.join(", ")}</div>
                                    <div className="mt-2">Источник: <a href={selected.url} className="text-blue-600 underline" target="_blank" rel="noreferrer">страница программы</a></div>
                                </div>
                                <div className="mt-4 flex flex-col gap-2">
                                    <button
                                        className="py-2 px-3 rounded-lg bg-blue-600 text-white font-medium"
                                        onClick={() => window.open(`max://bot?text=Хочу узнать больше про ${selected.name} в ВШЭ НН`, '_blank')}
                                    >Спросить бота в чате</button>
                                    <button
                                        className="py-2 px-3 rounded-lg border"
                                        onClick={() => exportChecklist(selected)}
                                    >Экспорт чек-листа</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">Выберите программу слева.</div>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <h4 className="font-semibold">Избранное</h4>
                        <div className="mt-2 text-sm text-gray-600">
                            {favorites.length === 0 ? (
                                <div>Пока пусто — нажмите ⭐ рядом с программой.</div>
                            ) : (
                                favorites.map((f) => (
                                    <div key={f.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                        <div>
                                            <div className="font-medium">{f.name}</div>
                                            <div className="text-xs text-gray-500">{f.faculty}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-sm text-blue-600 underline" onClick={() => openProgram(f)}>Открыть</button>
                                            <button className="text-sm text-red-500" onClick={() => toggleFavorite(f)}>Удалить</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </main>

            <footer className="max-w-5xl mx-auto mt-8 text-xs text-gray-500">
                Демо для хакатона MAX × ВШЭ НН. Бот в чате отвечает на вопросы, мини‑приложение показывает каталог.
            </footer>
        </div>
    );
}
