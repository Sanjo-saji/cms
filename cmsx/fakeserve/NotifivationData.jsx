import imagePath from "../app/constant/imagePath";

export const NotificationData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          Heading: "Event",
          Sender: "Principal",
          date: "20/10/2025",
          content:
            "Creating social media posts is a great way to hone your content writing skills. Since posts are typically very short, snappy, and quick, you can easily try out different styles of writing and see what people respond to.",
          image: imagePath.NotifictionIconGreen,
        },
        {
          id: 2,
          Heading: "Announcement",
          Sender: "Administrator",
          date: "25/10/2025",
          content:
            "A new update has been released with improved features and better performance. Make sure to update your app to the latest version to enjoy these enhancements.",
          image: imagePath.NotifictionIconYellow,
        },
        {
          id: 3,
          Heading: "Reminder",
          Sender: "Class Teacher",
          date: "01/11/2025",
          content:
            "Don't forget about the upcoming meeting scheduled for 1st November at 10:00 AM. Join the session on time and be prepared with the necessary documents.",
          image: imagePath.NotifictionIconRed,
        },
        {
          id: 4,
          Heading: "Promotion",
          Sender: "Marketing Team",
          date: "05/11/2025",
          content:
            "Our holiday sale is here! Get up to 50% off on all items. Hurry up and grab the best deals before the offer ends.",
          image: imagePath.NotifictionIconYellow,
        },
        {
          id: 5,
          Heading: "Survey",
          Sender: "HR Department",
          date: "10/11/2025",
          content:
            "We value your feedback! Participate in our survey and help us improve our services. It only takes 2 minutes to complete.",
          image: imagePath.NotifictionIconGreen,
        },
        {
          id: 6,
          Heading: "Alert",
          Sender: "IT Department",
          date: "12/11/2025",
          content:
            "System maintenance is scheduled for 12th November from 12:00 AM to 2:00 AM. Please save your work to avoid data loss.",
          image: imagePath.NotifictionIconRed,
        },
        {
          id: 7,
          Heading: "Offer",
          Sender: "Sales Team",
          date: "15/11/2025",
          content:
            "Limited-time offer! Get free delivery on all orders placed before 15th November. Don't miss out!",
          image: imagePath.NotifictionIconYellow,
        },
        {
          id: 8,
          Heading: "Meeting",
          Sender: "Project Manager",
          date: "18/11/2025",
          content:
            "A client meeting has been scheduled for 18th November at 3:00 PM. Join the meeting using the provided link.",
          image: imagePath.NotifictionIconGreen,
        },
        {
          id: 9,
          Heading: "Update",
          Sender: "Development Team",
          date: "20/11/2025",
          content:
            "Version 2.0 of our application is now available. Enjoy the latest features and a smoother experience.",
          image: imagePath.NotifictionIconYellow,
        },
        {
          id: 10,
          Heading: "Feedback",
          Sender: "Support Team",
          date: "22/11/2025",
          content:
            "Please share your thoughts on the recent updates. Your feedback helps us improve and serve you better.",
          image: imagePath.NotifictionIconGreen,
        },
      ]);
    }, 10);
  });
};
