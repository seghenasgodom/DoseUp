import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function Home() {
  const [pillName, setPillName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [reminders, setReminders] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [nextDoseIn, setNextDoseIn] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const pillColors = [
    'text-red-400', 'text-yellow-400', 'text-green-400', 'text-blue-400',
    'text-pink-400', 'text-purple-400', 'text-cyan-400', 'text-orange-400'
  ];

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getToday = () => {
    return new Date().toLocaleString('en-US', { weekday: 'short' });
  };

  useEffect(() => {
    const saved = localStorage.getItem('doseup-reminders');
    if (saved) setReminders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('doseup-reminders', JSON.stringify(reminders));
    updateNextDoseCountdown();
    checkConfetti();
  }, [reminders]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const updateNextDoseCountdown = () => {
    if (reminders.length === 0) {
      setNextDoseIn(null);
      return;
    }
    const now = new Date();
    const futureTimes = reminders
      .map((r) => {
        const [h, m] = r.time.split(':');
        const reminderDate = new Date();
        reminderDate.setHours(h);
        reminderDate.setMinutes(m);
        reminderDate.setSeconds(0);
        if (reminderDate < now) reminderDate.setDate(reminderDate.getDate() + 1);
        return reminderDate;
      })
      .sort((a, b) => a - b);
    const next = futureTimes[0];
    const diff = Math.max(0, next - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    setNextDoseIn(`${hours}h ${minutes}m`);
  };

  const handleAddReminder = () => {
    if (pillName && time) {
      const color = pillColors[Math.floor(Math.random() * pillColors.length)];
      const takenToday = {};
      allDays.forEach((day) => (takenToday[day] = false));
      const newReminder = {
        pillName,
        time,
        description,
        days: selectedDays,
        color,
        takenToday
      };
      setReminders([...reminders, newReminder]);
      setPillName('');
      setTime('');
      setDescription('');
      setSelectedDays([]);
    }
  };

  const toggleTakenForToday = (index) => {
    const today = getToday();
    const updated = [...reminders];
    if (updated[index].days.includes(today)) {
      updated[index].takenToday[today] = !updated[index].takenToday[today];
    }
    setReminders(updated);
  };

  const checkConfetti = () => {
    const today = getToday();
    const todaysReminders = reminders.filter((r) => r.days.includes(today));
    const allTaken = todaysReminders.length > 0 && todaysReminders.every((r) => r.takenToday[today]);
    setShowConfetti(allTaken);
    if (allTaken) {
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleDelete = (index) => {
    const updated = reminders.filter((_, i) => i !== index);
    setReminders(updated);
  };

  return (
    <main className={`${darkMode ? 'dark' : ''}`}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 py-6 font-sans">
        <div className="max-w-xl mx-auto bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-lg p-8 border dark:border-neutral-700 border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">DoseUp</h1>
            <button
              onClick={toggleDarkMode}
              className="text-sm border border-neutral-500 rounded px-3 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>

          {nextDoseIn && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Next dose in: <strong>{nextDoseIn}</strong>
            </p>
          )}

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

          <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded border border-gray-300 dark:border-neutral-700">
            <h2 className="text-lg font-semibold mb-2">Reminders</h2>
            {reminders.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400">No reminders yet.</p>
            ) : (
              <ul className="space-y-2">
                {reminders.map((reminder, index) => (
                  <li
                    key={index}
                    className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded p-3 flex justify-between items-center"
                  >
                    <div className={`${reminder.takenToday[getToday()] ? 'opacity-50 line-through' : ''}`}>
                      <strong className={`${reminder.color}`}>{reminder.pillName}</strong> at {reminder.time}
                      {reminder.description && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {reminder.description}
                        </p>
                      )}
                      {reminder.days?.length > 0 && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Days: {reminder.days.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        🗑️
                      </button>
                      <label className="text-xs flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={reminder.takenToday[getToday()]}
                          onChange={() => toggleTakenForToday(index)}
                        />
                        Taken
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
