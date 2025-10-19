import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm";

export default async function AddProductPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return <ProductForm />;
}






