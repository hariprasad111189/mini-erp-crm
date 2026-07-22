import { productService } from "../services/product.service";
import { asyncHandler } from "../utils/async-handler";

export const listProducts = asyncHandler(async (req, res) => {
  res.json(await productService.list(req.query as never));
});

export const getLowStockProducts = asyncHandler(async (_req, res) => {
  res.json({ data: await productService.lowStock() });
});

export const getProduct = asyncHandler(async (req, res) => {
  res.json(await productService.getById(String(req.params.id)));
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  res.json(await productService.update(String(req.params.id), req.body));
});

export const recordStockMovement = asyncHandler(async (req, res) => {
  const product = await productService.recordStockMovement({
    ...req.body,
    productId: String(req.params.id),
    createdById: req.user!.id
  });
  res.status(201).json(product);
});
