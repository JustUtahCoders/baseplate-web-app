import { NextFunction, Request, Response } from "express";
import { Result, ValidationError, validationResult } from "express-validator";

export function notFound(res: Response, msg: EndpointErrorMessage) {
  return res.status(404).json({
    errors: Array.isArray(msg) ? msg : [msg],
  });
}

export function notLoggedIn(res: Response, msg: EndpointErrorMessage) {
  return res.status(401).json({
    errors: Array.isArray(msg) ? msg : [msg],
  });
}

export function notAuthorized(res: Response, missingPermissions: string[]) {
  return res.status(403).json({
    errors: missingPermissions,
  });
}

export function invalidRequest(res: Response, errors: EndpointErrorMessage) {
  let msg;

  if ((errors as Result<ValidationError>).array) {
    msg = (errors as Result<ValidationError>).array();
  } else {
    msg = errors;
  }

  res.status(400).json({
    errors: Array.isArray(msg) ? msg : [msg],
  });
}

export function successNoContent(res: Response) {
  res.status(204).end();
}

export function created(res: Response, obj: object) {
  res.status(201).send(obj);
}

export function serverApiError(res: Response, msg: string | string[]) {
  console.error(msg);
  res.status(500).send({
    errors: Array.isArray(msg) ? msg : [msg],
  });
}

export function validationResponseMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    invalidRequest(res, errors);
  } else {
    next();
  }
}

type EndpointErrorMessage = string | Array<string> | Result<ValidationError>;
