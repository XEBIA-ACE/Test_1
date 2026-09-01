import { Request, Response, NextFunction } from 'express';
import { IProductService } from '../../../ports/inbound/IProductService';
import { CreateProductDto } from '../../../application/dto/CreateProductDto';
import { UpdateProductDto } from '../../../application/dto/UpdateProductDto';

export class ProductController {
  constructor(private readonly productService: IProductService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateProductDto = req.body;
      const product = await this.productService.createProduct(dto);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: UpdateProductDto = req.body;
      const product = await this.productService.updateProduct(req.params.id, dto);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 20;
      const result = await this.productService.listProducts(page, size);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
