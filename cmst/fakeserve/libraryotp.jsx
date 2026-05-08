export const fetchlibraryotp = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: "30-10-2024",
          otp: "76447",
        },
      ]);
    }, 10);
  });
};
