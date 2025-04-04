import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function Home() {
  const [pillName, setPillName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [reminders, setReminders] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [nextDoseIn, setNextDoseIn] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const pillColors = [
    'text-red-400',
    'text-yellow-400',
    'text-green-400',
    'text-blue-400',
    'text-pink-400',
    'text-purple-400',
    'text-cyan-400',
    'text-orange-400',
  ];

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const saved = localStorage.getItem('doseup-reminders');
    if (saved) setReminders(JSON.parse(saved));

    const storedTheme = localStorage.getItem('doseup-theme') || 'dark';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('doseup-reminders', JSON.stringify(reminders));
    updateNextDoseCountdown();
    checkProgress();
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('doseup-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
      const newReminder = {
        pillName,
        time,
        description,
        days: selectedDays,
        color,
        taken: false,
      };
      setReminders([...reminders, newReminder]);
      setPillName('');
      setTime('');
      setDescription('');
      setSelectedDays([]);
      updateNextDoseCountdown();
    }
  };

  const handleDelete = (indexToRemove) => {
    const updated = reminders.filter((_, i) => i !== indexToRemove);
    setReminders(updated);
  };

  const toggleTaken = (index) => {
    const updated = [...reminders];
    updated[index].taken = !updated[index].taken;
    setReminders(updated);
  };

  const checkProgress = () => {
    const total = reminders.length;
    const taken = reminders.filter((r) => r.taken).length;

    if (total > 0 && taken === total) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // stop after 3 seconds
    }
  };

  const getProgressPercent = () => {
    const total = reminders.length;
    const taken = reminders.filter((r) => r.taken).length;
    return total > 0 ? Math.round((taken / total) * 100) : 0;
  };

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
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={toggleTheme}
            className="w-4 h-4"
          />
          Enable Dark Mode
        </label>
      </div>

      <div className="max-w-xl mx-auto bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-lg p-8 border dark:border-neutral-700 border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">DoseUp</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="text-sm border border-neutral-500 rounded px-3 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
          >
            ⚙️ Settings
          </button>
        </div>

        {nextDoseIn && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
            Next dose in: <strong>{nextDoseIn}</strong>
          </p>
        )}

        {/* Progress Bar */}
        {reminders.length > 0 && (
          <div className="mb-6">
            <p className="text-sm mb-1">
              Progress: {reminders.filter((r) => r.taken).length} of {reminders.length} taken
            </p>
            <div className="w-full h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${getProgressPercent()}%` }}
              />
            </div>
          </div>
        )}

        {/* Form */}
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

        {/* Days of the Week */}
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

        {/* Reminder List */}
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
                  <div className={`${reminder.taken ? 'opacity-50 line-through' : ''}`}>
                    <strong className={`${reminder.color}`}>{reminder.pillName}</strong> at {reminder.time}
                    {reminder.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{reminder.description}</p>
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
                        checked={reminder.taken}
                        onChange={() => toggleTaken(index)}
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
    </main>
  );
}
