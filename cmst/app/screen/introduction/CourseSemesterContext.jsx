import { createContext, useContext, useState } from "react";

const CourseSemesterContext = createContext();

export const useCourseSemester = () => useContext(CourseSemesterContext);

export const CourseSemesterProvider = ({ children }) => {
  const [courseId, setCourseId] = useState(null);
  const [semesterId, setSemesterId] = useState(null);

  return (
    <CourseSemesterContext.Provider value={{ courseId, semesterId, setCourseId, setSemesterId }}>
      {children}
    </CourseSemesterContext.Provider>
  );
};
export default CourseSemesterProvider;