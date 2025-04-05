import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function Home() {
  const [pillName, setPillName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [reminders, setReminders] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getToday = () => new Date().toLocaleString('en-US', { weekday: 'short' });
  const today = getToday();

  useEffect(() => {
    const saved = localStorage.getItem('doseup-reminders');
    const storedTheme = localStorage.getItem('doseup-theme');
    if (saved) setReminders(JSON.parse(saved));
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('doseup-reminders', JSON.stringify(reminders));
    checkTodayTaken();
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('doseup-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const pillColors = [
    'text-red-400', 'text-yellow-400', 'text-green-400', 'text-blue-400',
    'text-pink-400', 'text-purple-400', 'text-cyan-400', 'text-orange-400'
  ];

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddReminder = () => {
    if (pillName && selectedDays.length > 0) {
      const color = pillColors[Math.floor(Math.random() * pillColors.length)];
      const takenPerDay = {};
      allDays.forEach((day) => (takenPerDay[day] = false));
      const newReminder = {
        pillName,
        time,
        description,
        days: selectedDays,
        color,
        takenPerDay
      };
      setReminders([...reminders, newReminder]);
      setPillName('');
      setTime('');
      setDescription('');
      setSelectedDays([]);
    }
  };

  const toggleTaken = (index) => {
    const updated = [...reminders];
    updated[index].takenPerDay[today] = !updated[index].takenPerDay[today];
    setReminders(updated);
  };

  const checkTodayTaken = () => {
    const todayReminders = reminders.filter((r) => r.days.includes(today));
    const allTaken = todayReminders.length > 0 && todayReminders.every((r) => r.takenPerDay[today]);
    setShowConfetti(allTaken);
    if (allTaken) {
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleDelete = (index) => {
    const updated = reminders.filter((_, i) => i !== index);
    setReminders(updated);
  };

  const todayReminders = reminders.filter((r) => r.days.includes(today));
  const takenCount = todayReminders.filter((r) => r.takenPerDay[today]).length;

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 py-6 font-sans transition relative overflow-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {/* Settings Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-neutral-900 border-l border-gray-300 dark:border-neutral-700 p-6 z-50 transform transition-transform duration-300 ${
          showSettings ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={() => setShowSettings(false)}>✖</button>
        </div>
        <div className="text-sm">
          <label className="flex items-center cursor-pointer">
            <div className="mr-3">Dark Mode:</div>
            <div className="relative">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="sr-only"
              />
              <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                  darkMode ? 'translate-x-full' : ''
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>

      <div className="max-w-xl mx-auto bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-lg p-8 border dark:border-neutral-700 border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">DoseUp</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="text-lg border border-neutral-500 rounded px-3 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
          >
            ⚙️
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Pill Name"
            value={pillName}
            onChange={(e) => setPillName(e.target.value)}
            className="bg-gray-200 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 text-black dark:text-white rounded px-4 py-2"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-gray-200 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 text-black dark:text-white rounded px-4 py-2"
          />
          <input
            type="text"
            placeholder="Notes or dosage"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-200 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 text-black dark:text-white rounded px-4 py-2"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {allDays.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-3 py-1 rounded-full border text-sm ${
                selectedDays.includes(day)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-400'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddReminder}
          className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded font-semibold hover:opacity-80 transition mb-6"
        >
          Add
        </button>

        <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded border border-gray-300 dark:border-neutral-700 mb-8">
          <h2 className="text-lg font-semibold mb-2">Daily Reminders</h2>
          <p className="text-sm mb-2 text-neutral-600 dark:text-neutral-400">
            {takenCount}/{todayReminders.length} taken today
          </p>
          {todayReminders.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400">No reminders for today.</p>
          ) : (
            <ul className="space-y-2">
              {todayReminders.map((reminder, index) => (
                <li
                  key={index}
                  className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded p-3 flex justify-between items-center"
                >
                  <div className={`${reminder.takenPerDay[today] ? 'opacity-50 line-through' : ''}`}>
                    <strong className={`${reminder.color}`}>{reminder.pillName}</strong> {reminder.time && `at ${reminder.time}`}
                    {reminder.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {reminder.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-white hover:text-red-400 text-sm"
                    >
                      ✖
                    </button>
                    <label className="text-xs flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={reminder.takenPerDay[today]}
                        onChange={() => toggleTaken(index)}
                        className="accent-white"
                      />
                      Taken
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Weekly Overview Agenda Style */}
        <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded border border-gray-300 dark:border-neutral-700">
          <h2 className="text-lg font-semibold mb-4">Weekly Overview</h2>
          <ul className="space-y-4">
            {allDays.map((day) => {
              const dayReminders = reminders
                .filter((r) => r.days.includes(day))
                .sort((a, b) => a.time.localeCompare(b.time));
              return (
                <li key={day}>
                  <div className="text-sm font-bold mb-1">{day}</div>
                  {dayReminders.length === 0 ? (
                    <p className="text-neutral-400 text-sm">—</p>
                  ) : (
                    <ul className="pl-4 border-l-2 border-white dark:border-white space-y-2">
                      {dayReminders.map((r, i) => (
                        <li key={i} className="relative pl-4">
                          <span className="absolute left-[-10px] top-1 w-2 h-2 bg-white dark:bg-white rounded-full"></span>
                          <span className="text-sm">
                            <strong>{r.time}</strong> - {r.pillName}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}
