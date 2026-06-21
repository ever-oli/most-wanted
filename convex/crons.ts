import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Expire unpaid orders past their reservation window and release the stock.
crons.interval("expire unpaid orders", { minutes: 5 }, internal.orders.expireStale, {});

export default crons;
