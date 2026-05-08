import imagePath from "../app/constant/imagePath";

export const Noteserve = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Java",
          image: imagePath.javaIcon,
          modules: [
            {
              id: 1,
              title: "OOP Principles",
              lectures: ["Introduction to OOP", "Classes & Objects", "Inheritance", "Polymorphism"]
            },
            {
              id: 2,
              title: "Java Basics",
              lectures: ["Variables & Data Types", "Control Flow", "Loops", "Functions"]
            }
          ]
        },
        {
          id: 2,
          name: "DSA",
          image: imagePath.dsaIcon,
          modules: [
            {
              id: 1,
              title: "Arrays & Strings",
              lectures: ["Introduction to Arrays", "Sorting Algorithms", "Searching Techniques", "String Manipulation"]
            },
            {
              id: 2,
              title: "Linked Lists & Trees",
              lectures: ["Singly Linked List", "Doubly Linked List", "Binary Trees", "Graph Traversal"]
            }
          ]
        },
        {
          id: 3,
          name: "Graphics",
          image: imagePath.graphicsIcon,
          modules: [
            {
              id: 1,
              title: "2D Graphics Basics",
              lectures: ["Coordinate Systems", "Drawing Shapes", "Colors & Textures", "Animation Basics"]
            },
            {
              id: 2,
              title: "3D Graphics & Rendering",
              lectures: ["3D Transformations", "Shading Techniques", "Ray Tracing", "OpenGL Basics"]
            }
          ]
        },
        {
          id: 4,
          name: "Networking",
          image: imagePath.networkingIcon,
          modules: [
            {
              id: 1,
              title: "Network Basics",
              lectures: ["Introduction to Networks", "OSI Model", "TCP/IP Protocols", "Subnetting"]
            },
            {
              id: 2,
              title: "Advanced Networking",
              lectures: ["Routing Protocols", "Network Security", "Cloud Networking", "Wireless Communication"]
            }
          ]
        },
        {
          id: 5,
          name: "Digital Logic",
          image: imagePath.digitalIcon,
          modules: [
            {
              id: 1,
              title: "Number Systems & Boolean Algebra",
              lectures: ["Binary & Hexadecimal Systems", "Logic Gates", "Boolean Algebra Laws", "K-Maps"]
            },
            {
              id: 2,
              title: "Sequential Circuits",
              lectures: ["Flip-Flops", "Counters", "Registers", "Memory Organization"]
            }
          ]
        }
      ]);
    }, 10);
  });
};
