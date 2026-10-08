// Built-in quote list. IDs are permanent: favorites are saved by ID, so never reuse or
// rename an existing ID. Add new quotes with new IDs instead.
const QUOTES = [
  {
    id: "knuth-premature-optimization",
    text: "Premature optimization is the root of all evil.",
    author: "Donald Knuth",
  },
  {
    id: "dijkstra-simplicity",
    text: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
  },
  {
    id: "dijkstra-testing",
    text: "Program testing can be used to show the presence of bugs, but never to show their absence!",
    author: "Edsger W. Dijkstra",
  },
  {
    id: "abelson-read-programs",
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
  },
  {
    id: "fowler-humans-understand",
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
  {
    id: "torvalds-show-code",
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
  },
  {
    id: "kay-invent-future",
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
  },
  {
    id: "kernighan-debugging",
    text: "Everyone knows that debugging is twice as hard as writing a program in the first place. So if you're as clever as you can be when you write it, how will you ever debug it?",
    author: "Brian Kernighan",
  },
  {
    id: "kernighan-complexity",
    text: "Controlling complexity is the essence of computer programming.",
    author: "Brian Kernighan",
  },
  {
    id: "berard-frozen-spec",
    text: "Walking on water and developing software from a specification are easy if both are frozen.",
    author: "Edward V. Berard",
  },
  {
    id: "karlton-hard-things",
    text: "There are only two hard things in Computer Science: cache invalidation and naming things.",
    author: "Phil Karlton",
  },
  {
    id: "beck-make-it-work",
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
  },
];

if (typeof module !== "undefined") module.exports = { QUOTES };
