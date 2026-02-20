<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
    public function get()
    {
        try {
            $data = Brand::query()->where("deleted_at", null)->orderBy("created_at", "desc")->get();
            return response()->json(["data" => $data, "message" => "Data Found Successfully", "status" => true], 200);
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }

    public function create(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required',
            ]);

            $isModelExist = Brand::where("name", $request->get("name"))->where('deleted_at', null)->first();

            if ($isModelExist) {
                return response()->json(["message" => "Brand Already Exist", "status" => false], 400);
            }

            Brand::create([
                'name' => $request->get("name"),
            ]);

            return response()->json(["message" => "Brand Created Successfully", "status" => true], 200);
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
    public function update(Request $request)
    {
        try {
            $request->validate([
                'id' => 'required|exists:brands,id',
                'name' => [
                    'required',

                ],
            ]);

            $isModelExist = Brand::where("name", $request->get("name"))->where('deleted_at', null)->whereNot("id", $request->get("id"))->first();

            if ($isModelExist) {
                return response()->json(["message" => "Brand Already Exist", "status" => false], 400);
            }

            $model = Brand::where("id", $request->get("id"))->first();
            $model->name = $request->get("name");
            $model->save();
            return response()->json(["message" => " Brand Updated Successfully", "status" => true], 200);
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
    public function delete(int $id)
    {
        try {
            $model = Brand::where("id", $id)->first();

            if ($model) {
                $model->delete();
                return response()->json(["message" => "Brand Deleted Successfully", "status" => true], 200);
            }
            $model->delete();
            return response()->json(["message" => "Brand Not Found", "status" => false], 404);
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
    public function deletedModel()
    {
        try {
            $data = Brand::onlyTrashed()->orderBy("created_at", "desc")->get();
            return response()->json(["data" => $data, "message" => "Data Found Successfully", "status" => true], 200);
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
    public function hardDelete(int $id)
    {
        try {
            $model = Brand::onlyTrashed()->where("id", $id)->first();

            if (!$model) {
                return response()->json(["message" => "Model Not Found", "status" => false], 404);
            }

            $model->forceDelete();
            return response()->json(["message" => "Model Deleted Successfully", "status" => true], 200);
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
    public function restore(int $id)
    {
        try {
            $model = Brand::onlyTrashed()->where("id", $id)->first();

            if (!$model) {
                return response()->json(["message" => "Model Not Found", "status" => false], 404);
            }

            $model->restore();
            return response()->json(["message" => "Model Restored Successfully", "status" => true], 200);
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
}
