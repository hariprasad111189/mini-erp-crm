import { challanService } from "../services/challan.service";
import { renderChallanPdf } from "../services/pdf.service";
import { asyncHandler } from "../utils/async-handler";

export const listChallans = asyncHandler(async (req, res) => {
  res.json(await challanService.list(req.query as never));
});

export const getChallan = asyncHandler(async (req, res) => {
  res.json(await challanService.getById(String(req.params.id)));
});

export const createChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.create(req.body, req.user!.id);
  res.status(201).json(challan);
});

export const confirmChallan = asyncHandler(async (req, res) => {
  res.json(await challanService.confirm(String(req.params.id), req.user!.id));
});

export const cancelChallan = asyncHandler(async (req, res) => {
  res.json(await challanService.cancel(String(req.params.id), req.user!.id));
});

export const downloadChallanPdf = asyncHandler(async (req, res) => {
  const challan = await challanService.getById(String(req.params.id));
  const pdf = await renderChallanPdf(challan);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${challan.challanNumber}.pdf"`);
  res.send(pdf);
});
