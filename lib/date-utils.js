function getMondayOfOffset(offset = 0) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = base.getDay(); // 0 Sun ... 6 Sat
  const mondayDelta = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + mondayDelta - offset * 7);
  return monday;
}

function getWeekKeyByOffset(offset = 0) {
  const monday = getMondayOfOffset(offset);
  const y = monday.getFullYear();
  const m = `${monday.getMonth() + 1}`.padStart(2, "0");
  const d = `${monday.getDate()}`.padStart(2, "0");
  return `${y}${m}${d}`;
}

module.exports = {
  getMondayOfOffset,
  getWeekKeyByOffset
};
