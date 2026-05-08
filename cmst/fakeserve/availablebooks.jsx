export const fetchavailablebooks = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: "C programming",
          author: "Brian W. Kernighan, Dennis M. Ritchie",
          image: require("@/assets/images/Libraryimages/c.svg"),
        },

        {
          id: 2,
          title: "Database Management System",
          author: "Hector,Garcia-Molina,Jeffrey D. UllmanJennifer Widom",
          image: require("@/assets/images/Libraryimages/dbms.jpg"),
        },
      ]);
    });
  });
};