import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/products/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} isEdit={true} />;
}







