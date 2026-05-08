import imagePath from "../app/constant/imagePath";

export const SubjetContent = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          subid: 1,
          Subject: "Maths",
          AttdecePercentage: "93%",
          persent: 93,
          Absent: 7,
          image: imagePath.MathsIcon,
          Marks: [
            {
              id: 1,
              title: "Model mark",
              date: "30-10-2024",
              performance: "Average",
              Total: 100,
              Score: 60,
              Percentage: "60%",
            },
            {
              id: 5,
              title: "Model mark",
              date: "05-10-2024",
              performance: "Excellent",
              Total: 100,
              Score: 90,
              Percentage: "90%",
            },
          ],
        },
        {
          subid: 2,
          Subject: "Physics",
          AttdecePercentage: "80%",
          persent: 80,
          Absent: 20,
          image: imagePath.PhysicsIcon,
          Marks: [
            {
              id: 3,
              title: "Model mark",
              date: "30-10-2024",
              performance: "Good",
              Total: 100,
              Score: 80,
              Percentage: "80%",
            },
          ],
        },
        {
          subid: 3,
          Subject: "Chemistry",
          AttdecePercentage: "95%",
          persent: 95,
          Absent: 5,
          image: imagePath.ChemistryIcon,
          Marks: [],
        },
        {
          subid: 4,
          Subject: "Computer",
          AttdecePercentage: "100%",
          persent: 100,
          Absent: 0,
          image: imagePath.ComputerIcon,
          Marks: [
            {
              id: 4,
              title: "Test Paper",
              date: "31-10-2024",
              performance: "Average",
              Total: 100,
              Score: 60,
              Percentage: "60%",
            },
          ],
        },
        {
          subid: 5,
          Subject: "Biology",
          AttdecePercentage: "85%",
          persent: 85,
          Absent: 15,
          image: imagePath.BiologyIcon,
          Marks: [
            {
              id: 2,
              title: "Model mark",
              date: "30-10-2024",
              performance: "Average",
              Total: 100,
              Score: 40,
              Percentage: "40%",
            },
          ],
        },
      ]);
    }, 1);
  });
};
