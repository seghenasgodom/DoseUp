import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function Home() {
  const [pillName, setPillName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('forever');
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

  const pillColors = ['text-red-400', 'text-yellow-400', 'text-green-400', 'text-blue-400'];

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const isReminderActive = (reminder) => {
    if (!reminder.duration || reminder.duration === 'forever') return true;
    const createdDate = new Date(reminder.created);
    const endDate = new Date(createdDate);
    endDate.setDate(endDate.getDate() + parseInt(reminder.duration));
    return new Date() <= endDate;
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
        takenPerDay,
        created: new Date().toISOString(),
        duration,
      };
      setReminders([...reminders, newReminder]);
      setPillName('');
      setTime('');
      setDescription('');
      setSelectedDays([]);
      setDuration('forever');
    }
  };

  const toggleTaken = (index) => {
    const updated = [...reminders];
    updated[index].takenPerDay[today] = !updated[index].takenPerDay[today];
    setReminders(updated);
  };

  const checkTodayTaken = () => {
    const todayReminders = reminders.filter(
      (r) => r.days.includes(today) && isReminderActive(r)
    );
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

  const todayReminders = reminders.filter(
    (r) => r.days.includes(today) && isReminderActive(r)
  );
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
        <label className="flex items-center cursor-pointer">
          <span className="mr-3">Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="accent-white"
          />
        </label>
      </div>

      {/* Main App UI */}
      <div className="max-w-xl mx-auto bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-lg p-8 border dark:border-neutral-700 border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">DoseUp</h1>
          <button onClick={() => setShowSettings(true)} className="text-lg border border-neutral-500 rounded px-3 py-1">⚙️</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <input type="text" value={pillName} onChange={(e) => setPillName(e.target.value)} placeholder="Pill Name" className="bg-gray-200 dark:bg-neutral-800 rounded px-4 py-2" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-gray-200 dark:bg-neutral-800 rounded px-4 py-2" />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes" className="bg-gray-200 dark:bg-neutral-800 rounded px-4 py-2" />
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="bg-gray-200 dark:bg-neutral-800 rounded px-4 py-2">
            <option value="forever">Constant</option>
            <option value="7">1 Week</option>
            <option value="14">2 Weeks</option>
            <option value="21">3 Weeks</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {allDays.map((day) => (
            <button key={day} onClick={() => toggleDay(day)} className={`px-3 py-1 rounded-full border ${selectedDays.includes(day) ? 'bg-blue-500 text-white' : 'border-gray-400'}`}>{day}</button>
          ))}
        </div>

        <button onClick={handleAddReminder} className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded mb-6">
          Add
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Daily Reminders</h2>
          <p className="text-sm mb-2 text-neutral-600 dark:text-neutral-400">
            {takenCount}/{todayReminders.length} taken today
          </p>
          <ul className="space-y-2">
            {todayReminders.map((reminder, index) => (
              <li key={index} className="bg-white dark:bg-neutral-900 border rounded p-3 flex justify-between items-center">
                <div>
                  <strong className={reminder.color}>{reminder.pillName}</strong> {reminder.time && `at ${reminder.time}`}
                  {reminder.description && <p className="text-sm">{reminder.description}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button onClick={() => handleDelete(index)} className="text-white hover:text-red-400 text-sm">✖</button>
                  <label className="text-xs flex items-center gap-1">
                    <input type="checkbox" checked={reminder.takenPerDay[today]} onChange={() => toggleTaken(index)} className="accent-white" />
                    Taken
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Weekly Overview with Calendar Dates */}
        <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded border">
          <h2 className="text-lg font-semibold mb-1">April</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Weekly Overview</p>
          <ul className="space-y-4">
            {allDays.map((day, index) => {
              const date = new Date();
              const todayIndex = date.getDay();
              const adjustedIndex = index === 6 ? 0 : index + 1;
              const dayDate = new Date();
              dayDate.setDate(date.getDate() + ((adjustedIndex - todayIndex + 7) % 7));
              const formattedDate = `${day} ${dayDate.getDate()}`;
              const dayReminders = reminders
                .filter((r) => r.days.includes(day) && isReminderActive(r))
                .sort((a, b) => a.time.localeCompare(b.time));

              return (
                <li key={day}>
                  <div className="text-sm font-bold mb-1">{formattedDate}</div>
                  {dayReminders.length === 0 ? (
                    <p className="text-neutral-400 text-sm">—</p>
                  ) : (
                    <ul className="pl-4 space-y-2">
                      {dayReminders.map((r, i) => (
                        <li key={i} className="relative pl-4">
                          <span className="absolute left-0 top-1 text-white dark:text-white">-</span>
                          <span className="ml-4 text-sm">
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

