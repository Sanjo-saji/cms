export const fetchcheckedbooks = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: "Introduction to Programming",
          Duedate: "03-03-2025",
          image: require("@/assets/images/Libraryimages/introprgm.png"),
        },

        {
          id: 2,
          title: "Introduction to Algorithms",
          Duedate: "07-03-2025",
          image: require("@/assets/images/Libraryimages/introalgo.jpg"),
        },
      ]);
    });
  });
};
