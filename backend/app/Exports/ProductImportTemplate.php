<?php

namespace App\Exports;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Filter;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class ProductImportTemplate implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'Products' => new ProductImportMainSheet(),
            'Categories' => new CategoryListSheet(),
            'Brands' => new BrandListSheet(),
            'StockStatuses' => new StockStatusSheet(),
            'Filter Mapping' => new FilterMappingSheet(),
        ];
    }
}

class ProductImportMainSheet implements 
    \Maatwebsite\Excel\Concerns\WithHeadings, 
    \Maatwebsite\Excel\Concerns\WithTitle, 
    \Maatwebsite\Excel\Concerns\WithEvents, 
    \Maatwebsite\Excel\Concerns\ShouldAutoSize,
    \Maatwebsite\Excel\Concerns\FromCollection
{
    public function collection()
    {
        return new \Illuminate\Support\Collection([]);
    }

    public function title(): string
    {
        return 'Products Import';
    }

    public function headings(): array
    {
        $columns = [
            'sku', 'name', 'slug', 'description', 'short_description', 
            'price', 'original_price', 'cost_price', 'stock_quantity',
            'categories', 'brand_name_or_id', 'is_active', 'is_featured',
            'image_urls', 'image_filenames', 'stock_status', 'variant_sku', 'variant_price', 'variant_stock'
        ];

        $filters = Filter::orderBy('name')->get(['name']);
        foreach ($filters as $filter) {
            $columns[] = 'Filter: ' . $filter->name;
        }

        return [
            $columns,
            array_merge(
                array_fill(0, 9, 'Fill values below'),
                ['Pick names from list'],
                ['Pick brand from list'],
                array_fill(0, 3, 'Fill values'), // is_active, is_featured, image_urls
                ['Image Filenames (Comma separated)'],
                ['Stock Status (in_stock, out_of_stock, stock_based)'],
                ['Variant SKU'],
                ['Variant Price'],
                ['Variant Stock'],
                $filters->map(fn($f) => "Lights up if required")->toArray()
            )
        ];
    }

    public function registerEvents(): array
    {
        return [
            \Maatwebsite\Excel\Events\AfterSheet::class => function(\Maatwebsite\Excel\Events\AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // 1. Categories Dropdown (Column J)
                $objValJ = $sheet->getDataValidation('J3:J1000');
                $objValJ->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
                $objValJ->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
                $objValJ->setAllowBlank(true);
                $objValJ->setShowDropDown(true);
                $objValJ->setFormula1("'Categories'!\$A\$2:\$A\$200");
                $objValJ->setPromptTitle('Pick category');
                $objValJ->setPrompt('Select one or type multiple names separated by comma.');

                // 2. Brands Dropdown (Column K)
                $objValK = $sheet->getDataValidation('K3:K1000');
                $objValK->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
                $objValK->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
                $objValK->setShowDropDown(true);
                $objValK->setFormula1("'Brands'!\$A\$2:\$A\$200");
                $objValK->setPromptTitle('Pick brand');

                // 3. Stock Status Dropdown (Column P)
                $objValP = $sheet->getDataValidation('P3:P1000');
                $objValP->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
                $objValP->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
                $objValP->setAllowBlank(false);
                $objValP->setShowDropDown(true);
                $objValP->setFormula1("'StockStatuses'!\$A\$2:\$A\$4"); // in_stock, out_of_stock, stock_based (3 items)
                $objValP->setPromptTitle('Pick stock status');

                // 4. Filters Columns (S onwards)
                // Columns: A=sku, B=name, C=slug, D=desc, E=short_desc, F=price, G=orig, H=cost, I=qty, J=cats, K=brand, L=active, M=feat, N=urls, O=filenames, P=stock_status, Q=vsku, R=vprice, S=vstock, T... filters
                $filters = Filter::orderBy('name')->get();
                $startColIndex = 20; // Column T (1-indexed)

                foreach ($filters as $index => $filter) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColIndex + $index);
                    
                    if (!empty($filter->options) && is_array($filter->options)) {
                        $objValidation = $sheet->getDataValidation($colLetter . '3:' . $colLetter . '1000');
                        $objValidation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
                        $objValidation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
                        $objValidation->setShowDropDown(true);
                        $optionsStr = '"' . implode(',', $filter->options) . '"';
                        $objValidation->setFormula1($optionsStr);
                    }

                    $mapColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 2);
                    $conditional = new \PhpOffice\PhpSpreadsheet\Style\Conditional();
                    $conditional->setConditionType(\PhpOffice\PhpSpreadsheet\Style\Conditional::CONDITION_EXPRESSION);
                    $formula = "SUMPRODUCT(ISNUMBER(SEARCH(\"|\" & TRIM('Filter Mapping'!\$A\$2:\$A\$200) & \"|\", \"|\" & SUBSTITUTE(SUBSTITUTE(TRIM(\$J3), \", \", \"|\"), \",\", \"|\") & \"|\")) * ('Filter Mapping'!" . $mapColLetter . "\$2:" . $mapColLetter . "\$200=1)) > 0";
                    $conditional->addCondition($formula);
                    $conditional->getStyle()->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
                    $conditional->getStyle()->getFill()->getStartColor()->setARGB('FFD9ead3');
                    $sheet->getStyle($colLetter . '3:' . $colLetter . '1000')->setConditionalStyles([$conditional]);
                }

                // Boolean dropdowns (Active/Featured/ManageStock)
                foreach (['L', 'M'] as $col) {
                    $objValidation = $sheet->getDataValidation($col . '3:' . $col . '1000');
                    $objValidation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
                    $objValidation->setFormula1('"true,false"');
                    $objValidation->setShowDropDown(true);
                }
            },
        ];
    }
}

class CategoryListSheet implements 
    \Maatwebsite\Excel\Concerns\FromCollection, 
    \Maatwebsite\Excel\Concerns\WithTitle, 
    \Maatwebsite\Excel\Concerns\WithHeadings
{
    public function title(): string
    {
        return 'Categories';
    }

    public function headings(): array
    {
        return ['Valid Category Names'];
    }

    public function collection()
    {
        return Category::with('parent')->get()->map(function($cat) {
            $name = $cat->name;
            $parent = $cat->parent;
            while ($parent) {
                $name = $parent->name . ' > ' . $name;
                $parent = $parent->parent;
            }
            return ['name' => $name];
        });
    }
}

class BrandListSheet implements 
    \Maatwebsite\Excel\Concerns\FromCollection, 
    \Maatwebsite\Excel\Concerns\WithTitle, 
    \Maatwebsite\Excel\Concerns\WithHeadings
{
    public function title(): string
    {
        return 'Brands';
    }

    public function headings(): array
    {
        return ['Valid Brand Names'];
    }

    public function collection()
    {
        return Brand::orderBy('name')->get(['name']);
    }
}

class FilterMappingSheet implements 
    \Maatwebsite\Excel\Concerns\FromCollection, 
    \Maatwebsite\Excel\Concerns\WithTitle, 
    \Maatwebsite\Excel\Concerns\WithHeadings
{
    public function title(): string
    {
        return 'Filter Mapping';
    }

    public function headings(): array
    {
        $headers = ['Category Path'];
        $filters = Filter::orderBy('name')->pluck('name')->toArray();
        return array_merge($headers, $filters);
    }

    public function collection()
    {
        $allFilters = Filter::orderBy('name')->get();
        $categories = Category::with(['parent', 'filterEntities'])->get();
        
        $rows = [];
        foreach ($categories as $cat) {
            $pathName = $cat->name;
            $p = $cat->parent;
            while ($p) {
                $pathName = $p->name . ' > ' . $pathName;
                $p = $p->parent;
            }

            $catFilters = $this->getAllCategoryFilters($cat);
            $filterIds = $catFilters->pluck('id')->toArray();

            $row = [$pathName];
            foreach ($allFilters as $filter) {
                $row[] = in_array($filter->id, $filterIds) ? 1 : 0;
            }
            $rows[] = $row;
        }

        return new \Illuminate\Support\Collection($rows);
    }

    private function getAllCategoryFilters($category)
    {
        if (!$category->relationLoaded('filterEntities')) {
            $category->load('filterEntities');
        }
        $filters = $category->filterEntities;
        if ($category->parent_id) {
            $parent = Category::find($category->parent_id);
            if ($parent) {
                $filters = $filters->merge($this->getAllCategoryFilters($parent));
            }
        }
        return $filters->unique('id');
    }
}

class StockStatusSheet implements 
    \Maatwebsite\Excel\Concerns\FromCollection, 
    \Maatwebsite\Excel\Concerns\WithTitle, 
    \Maatwebsite\Excel\Concerns\WithHeadings
{
    public function title(): string
    {
        return 'StockStatuses';
    }

    public function headings(): array
    {
        return ['Valid Statuses'];
    }

    public function collection()
    {
        return collect([
            ['in_stock'],
            ['out_of_stock'],
            ['stock_based'],
        ]);
    }
}
