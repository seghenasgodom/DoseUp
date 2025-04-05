import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function Home() {
  const [pillName, setPillName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [reminders, setReminders] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getToday = () => new Date().toLocaleString('en-US', { weekday: 'short' });
  const today = getToday();

  useEffect(() => {
    const saved = localStorage.getItem('doseup-reminders');
    if (saved) setReminders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('doseup-reminders', JSON.stringify(reminders));
    checkTodayTaken();
  }, [reminders]);

  const pillColors = ['text-red-400', 'text-yellow-400', 'text-green-400', 'text-blue-400'];

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
        takenPerDay,
        created: new Date().toISOString(),
        duration: 'forever',
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

  const getWeekDates = () => {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      dates.push({ day: allDays[i], date: d });
    }
    return dates;
  };

  return (
    <main className="min-h-screen bg-white text-black px-4 py-6 font-sans transition relative overflow-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <div className="max-w-xl mx-auto bg-gray-100 shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">DoseUp</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <input type="text" value={pillName} onChange={(e) => setPillName(e.target.value)} placeholder="Pill Name" className="bg-gray-200 rounded px-4 py-2" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-gray-200 rounded px-4 py-2" />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes" className="bg-gray-200 rounded px-4 py-2" />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {allDays.map((day) => (
            <button key={day} onClick={() => toggleDay(day)} className={`px-3 py-1 rounded-full border ${selectedDays.includes(day) ? 'bg-blue-500 text-white' : 'border-gray-400'}`}>{day}</button>
          ))}
        </div>

        <button onClick={handleAddReminder} className="w-full bg-black text-white px-4 py-2 rounded mb-6">
          Add
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Daily Reminders</h2>
          <p className="text-sm mb-2 text-neutral-600">
            {takenCount}/{todayReminders.length} taken today
          </p>
          <ul className="space-y-2">
            {todayReminders.map((reminder, index) => (
              <li key={index} className="bg-white border rounded p-3 flex justify-between items-center">
                <div>
                  <strong className={reminder.color}>{reminder.pillName}</strong> {reminder.time && `at ${reminder.time}`}
                  {reminder.description && <p className="text-sm">{reminder.description}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button onClick={() => handleDelete(index)} className="text-black hover:text-red-400 text-sm">✖</button>
                  <label className="text-xs flex items-center gap-1">
                    <input type="checkbox" checked={reminder.takenPerDay[today]} onChange={() => toggleTaken(index)} className="accent-black" />
                    Taken
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded border">
          <h2 className="text-lg font-semibold mb-1">{new Date().toLocaleString('en-US', { month: 'long' })}</h2>
          <p className="text-sm text-neutral-500 mb-4">Weekly Overview</p>
          <ul className="space-y-4">
            {getWeekDates().map(({ day, date }) => {
              const formattedDate = `${day} ${date.getDate()}`;
              const dayReminders = reminders
                .filter((r) => r.days.includes(day))
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
                          <span className="absolute left-0 top-1 text-black">-</span>
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
