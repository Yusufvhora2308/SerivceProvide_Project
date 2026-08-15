import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get("/services");

            setServices(response.data.data);
        } catch (error) {
            console.error(error);
            setError("Unable to load services.");
        } finally {
            setLoading(false);
        }
    };
    console.log(localStorage.getItem("token"));
    
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">
                    Loading services...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-6xl">

                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    What service do you need?
                </h1>

                <p className="mb-8 text-gray-500">
                    Choose a service and we'll find nearby providers for you.
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                    {services.map((service) => (

                        <div
                            key={service.id}
                            onClick={() => navigate(`/customer/services/${service.id}/request`)}
                            className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >

                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                                🔧
                            </div>

                            <h2 className="text-lg font-semibold text-gray-900">
                                {service.name}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {service.category}
                            </p>

                            <p className="mt-4 text-sm text-gray-600">
                                Starting from
                            </p>

                            <p className="text-xl font-bold text-gray-900">
                                ₹{service.base_price}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
};

export default Services;