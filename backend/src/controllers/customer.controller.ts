import { customerService } from "../services/customer.service";
import { asyncHandler } from "../utils/async-handler";

export const listCustomers = asyncHandler(async (req, res) => {
  res.json(await customerService.list(req.query as never));
});

export const getCustomer = asyncHandler(async (req, res) => {
  res.json(await customerService.getById(String(req.params.id)));
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.create(req.body);
  res.status(201).json(customer);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  res.json(await customerService.update(String(req.params.id), req.body));
});

export const addFollowUpNote = asyncHandler(async (req, res) => {
  const note = await customerService.addFollowUp(String(req.params.id), req.user!.id, req.body.note);
  res.status(201).json(note);
});
