export const chatcontacts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          Name: "Nick Fury",
          image: require("@/assets/images/Chat/nick.jpg"),
        },
        {
          id: 2,
          Name: "Tony Stark",
          image: require("@/assets/images/Chat/tony.jpg"),
        },
        {
          id: 3,
          Name: "Bruce Wayne",
          image: require("@/assets/images/Chat/bat.jpg"),
        },
        {
          id: 4,
          Name: "Clark Kent",
          image: require("@/assets/images/Chat/clark.jpg"),
        },
        {
          id: 5,
          Name: "Diana Prince",
          image: require("@/assets/images/Chat/diana.jpg"),
        },
        
        {
          id: 7,
          Name: "Peter Parker",
          image: require("@/assets/images/Chat/spidey.jpg"),
        },
      ]);
    },1); // Simulated network delay
  });
};
