function randomEmoji() {
  const emojis = [
    "🔬",
    "😁",
    "🧪",
    "⚗️",
    "👋",
    "🤖",
    "✨",
    "🎉",
    "🙃",
    "🤯",
    "👽",
  ];

  const random = Math.floor(Math.random() * emojis.length);
  return emojis[random];
}

export default randomEmoji;
