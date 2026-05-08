import imagePath from "../app/constant/imagePath";
export const SubectPerformance = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          Subject: "Computer",
          performance: "Average",
          Percentage: 60,
          image: imagePath.ComputerIcon,
        },
        {
          id: 2,
          Subject: "Maths",
          performance: "Average",
          Percentage: 40,
          image: imagePath.MathsIcon,
        },
        {
          id: 3,
          Subject: "Physics",
          performance: "Good",
          Percentage: 80,
          image: imagePath.PhysicsIcon,
        },
        {
          id: 4,
          Subject: "Chemistry",
          performance: "Average",
          Percentage: 60,
          image: imagePath.ChemistryIcon,
        },
        {
          id: 5,
          Subject: "Biology",
          performance: "Excellent",
          Percentage: 90,
          image: imagePath.BiologyIcon,
        },
      ]);
    });
  });
};
