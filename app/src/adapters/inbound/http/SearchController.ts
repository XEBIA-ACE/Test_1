import { Request, Response, NextFunction } from 'express';
import { ISearchService } from '../../../ports/inbound/ISearchService';
import { SearchQueryDto } from '../../../application/dto/SearchQueryDto';

export class SearchController {
  constructor(private readonly searchService: ISearchService) {}

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: SearchQueryDto = {
        q: (req.query.q as string) ?? '',
        page: parseInt(req.query.page as string) || 1,
        size: parseInt(req.query.size as string) || 20,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        inStock: req.query.inStock === 'true',
      };
      const result = await this.searchService.search(query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async browseByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 20;
      const filters = {
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        inStock: req.query.inStock === 'true',
      };
      const result = await this.searchService.browseByCategory(slug, filters, page, size);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
