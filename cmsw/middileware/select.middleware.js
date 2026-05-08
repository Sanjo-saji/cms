export const extractCourseAndSemster = (req, res, next) => {
  const course = (req.query?.course || req.body?.course)?.trim?.();
  const semster = (req.query?.semster || req.body?.semster)?.trim?.();
  if (!course || !semster) {
    return res
      .status(400)
      .json({ message: "Course and Semster are required" });
  }
  req.course = course;
  req.semster = semster;
  next();
};
