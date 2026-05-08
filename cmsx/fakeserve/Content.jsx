import imagePath from "../app/constant/imagePath";
export const fetchContent = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: "30-10-2024",
          message: "Tomorrow is a holiday",
          image: imagePath.anime1,
        },
        {
          id: 2,
          title: "10-11-2022",
          message: "Meeting at 2:00 PM",
          image: imagePath.anime2,
        },
        {
          id: 3,
          title: "11-10-2023",
          message: "Please submit your reports",
          image: imagePath.anime3,
        },
        {
          id: 4,
          title: "11-10-2023",
          message: "New project starting next week",
          image: imagePath.anime1,
        },
        {
          id: 5,
          title: "11-10-2023",
          message: "Lunch at 12:30 PM",
          image: imagePath.anime2,
        },
        {
          id: 6,
          title: "11-10-2023",
          message: "Team outing on Friday",
          image: imagePath.anime3,
        },
      ]);
    }, 1);
  });
};
