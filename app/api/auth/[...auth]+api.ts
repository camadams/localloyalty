import { auth } from "@/lib/auth";

export const GET = (request: Request) => {
  console.log("!!!!!!")
  return auth.handler(request);
};

export const POST = (request: Request) => {
  console.log("!!!!!!")
  console.log(process.env.GOOGLE_CLIENT_ID)
  // console.log(request)
  return auth.handler(request);
};
