import { getDb } from "../../db";
import { DonationsService } from "../../services/donations";

export default defineEventHandler(async (event) => {
  const db = getDb(event);
  const categories = await DonationsService.listCategories(db);
  return { categories };
});
