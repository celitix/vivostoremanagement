<?php

namespace App\Http\Controllers;

use App\Models\MobileModel;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
    public function get()
    {
        $user = auth()->user();
        try {
            $data = MobileModel::query()->where("deleted_at", null)->orderBy("created_at", "desc")->get();

            if (!$user) {
                $data = $data->select("id", "model");
            }
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

            $isModelExist = MobileModel::where("name", $request->get("name"))->where('deleted_at', null)->first();

            if ($isModelExist) {
                return response()->json(["message" => "Brand Already Exist", "status" => false], 400);
            }

            MobileModel::create([
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
                'id' => 'required|exists:mobile_models,id',
                'name' => [
                    'required',

                ],
            ]);

            $isModelExist = MobileModel::where("name", $request->get("name"))->where('deleted_at', null)->whereNot("id", $request->get("id"))->first();

            if ($isModelExist) {
                return response()->json(["message" => "Brand Already Exist", "status" => false], 400);
            }

            $model = MobileModel::where("id", $request->get("id"))->first();
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
            $model = MobileModel::where("id", $id)->first();

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
            $data = MobileModel::onlyTrashed()->orderBy("created_at", "desc")->get();
            return response()->json(["data" => $data, "message" => "Data Found Successfully", "status" => true], 200);
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
    public function hardDelete(int $id)
    {
        try {
            $model = MobileModel::onlyTrashed()->where("id", $id)->first();

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
            $model = MobileModel::onlyTrashed()->where("id", $id)->first();

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
