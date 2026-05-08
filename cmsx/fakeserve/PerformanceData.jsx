import imagePath from "../app/constant/imagePath";

export const PerformanceData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          date: "2025-03-03",
          subject: [
            {
              Physics: "Absent",
              Maths: "Present",
              Chemistry: "Present",
              DSA: "Present",
              DAA: "Absent",
            },
          ],
        },
        {
          id: 2,
          date: "2025-03-04",
          subject: [
            {
              Physics: "Present",
              Maths: "Absent",
              Chemistry: "Present",
              DSA: "Present",
              DAA: "Present",
            },
          ],
        },
        {
          id: 3,
          date: "2025-03-05",
          subject: [
            {
              Physics: "Absent",
              Maths: "Present",
              Chemistry: "Absent",
              DSA: "Present",
              DAA: "Present",
            },
          ],
        },
        {
          id: 4,
          date: "2025-03-06",
          subject: [
            {
              Physics: "Present",
              Maths: "Present",
              Chemistry: "Present",
              DSA: "Absent",
              DAA: "Absent",
            },
          ],
        },
        {
          id: 5,
          date: "2025-03-07",
          subject: [
            {
              Physics: "Absent",
              Maths: "Present",
              Chemistry: "Present",
              DSA: "Present",
              DAA: "Absent",
            },
          ],
        },
        {
          id: 6,
          date: "2025-03-08",
          subject: [
            {
              Physics: "Present",
              Maths: "Present",
              Chemistry: "Absent",
              DSA: "Absent",
              DAA: "Present",
            },
          ],
        },
        {
          id: 7,
          date: "2025-03-09",
          subject: [
            {
              Physics: "Absent",
              Maths: "Absent",
              Chemistry: "Present",
              DSALAB: "Present",
              DAA: "Present",
            },
          ],
        },
        {
          id: 8,
          date: "2025-03-10",
          subject: [
            {
              Physics: "Present",
              Maths: "Present",
              Chemistry: "Present",
              DSA: "Absent",
              DAA: "Present",
            },
          ],
        },
        {
          id: 9,
          date: "2025-03-11",
          subject: [
            {
              Physics: "Present",
              Maths: "Absent",
              Chemistry: "Absent",
              DSA: "Present",
              DAA: "Absent",
            },
          ],
        },
        {
          id: 10,
          date: "2025-03-12",
          subject: [
            {
              Physics: "Absent",
              Maths: "Present",
              Chemistry: "Present",
              DSA: "Absent",
              DAA: "Present",
            },
          ],
        },
        {
          id: 11,
          date: "2025-03-13",
          subject: [
            {
              Physics: "Absent",
              Maths: "Present",
              Chemistry: "Present",
              DSALAB: "Absent",
              DAA: "Present",
            },
          ],
        },
      ]);
    });
  });
};
