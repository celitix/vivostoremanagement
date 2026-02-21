<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromArray;


class DynamicExport implements FromArray
{
    protected $data;

    public function __construct(Collection $data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $excelData = [];

        $excelData[] = [
            // 'ID',
            'Store Name',
            'Store Code',
            'Consumer Name',
            'Contact Number',
            'Brand',
            "Gender",
            "Age",
            "Pincode",
        ];

        foreach ($this->data as $item) {
            $excelData[] = [
                // $item->id,
                $item->token->user->name,
                $item->token->user->storeName,
                $item->consumer_name,
                $item->contact_number,
                $item->brand?->name,
                $item->gender,
                $item->age,
                $item->pincode
            ];
        }

        return $excelData;
    }
}
