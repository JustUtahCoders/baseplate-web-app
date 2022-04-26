import { router } from "./Router";
import { notFound } from "./Utils/EndpointResponses";

router.use("/api", (req, res, next) => {
  return notFound(res, `No API implemented for ${req.method} ${req.path}`);
});
