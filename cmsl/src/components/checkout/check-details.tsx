import man from "@/assets/man.jpg";

const CheckDetails = ({
  studentName,
  bookCount,
  delay,
  course,
  semester,
  registerNumber,
}: {
  studentName: string;
  bookCount: number;
  delay: string | number;
  course: string;
  semester: string;
  registerNumber: string;
}) => {
  return (
    <div className="flex flex-col items-center rounded-2xl p-6 w-full ">
      {/* Avatar */}
      <div className="relative w-28 h-28">
        <img
          src={man}
          alt="Student"
          className="w-28 h-28 rounded-full border-2 border-indigo-500 shadow-md object-cover"
        />
        {/* Status indicator */}
        <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-transparent animate-pulse"></span>
      </div>

      {/* Student Name */}
      <h2 className="mt-4 text-2xl font-semibold text-white">{studentName}</h2>

      {/* Info Section */}
      <div className="mt-5 w-full flex flex-col gap-3">
        <div className="flex justify-between text-gray-200 p-2 px-4 rounded-lg">
          <span>Register Number</span>
          <span className="font-semibold text-indigo-400">
            {registerNumber}
          </span>
        </div>
        <div className="flex justify-between text-gray-200 p-2 px-4 rounded-lg">
          <span>Checked Out Books</span>
          <span className="font-semibold text-indigo-400">{bookCount}</span>
        </div>
        <div className="flex justify-between text-gray-200 p-2 px-4 rounded-lg">
          <span>Delay</span>
          <span className="font-semibold text-red-400">{delay}</span>
        </div>
        <div className="flex justify-between text-gray-200 p-2 px-4 rounded-lg">
          <span>Course</span>
          <span className="font-semibold text-green-300">{course}</span>
        </div>
        <div className="flex justify-between text-gray-200 p-2 px-4 rounded-lg">
          <span>Semester</span>
          <span className="font-semibold text-yellow-300">{semester}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckDetails;
