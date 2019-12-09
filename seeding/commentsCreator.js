const comments = []

const NUM_COMMENTS = 10

const commentText = [
  'Utter garbage',
  'A do-not-enter zone',
  'Could be worse, definitely could be better',
  'Who do they think they\'re tryna fool here??',
  'Distinctly mediocre',
  'It\'s not bad, but it\'s not great either, so at that point,' +
  ' why even have a park??',
  'Brought me out of my shell. Literally. I\'m a baby bird and this is my home',
  'Made me an environmentalist',
  'Life changing.',
  'Got me into rock climbing. This is the greatest compliment I can give.'
]

for (let i = 0; i < NUM_COMMENTS; i++) {
  const comment = {}
  const rating = Math.ceil((i+1) / 2)
  comment.rating = rating
  comment.text = commentText[i % commentText.length]
  comment.author = {}

  comments.push(comment)
}

module.exports = comments
