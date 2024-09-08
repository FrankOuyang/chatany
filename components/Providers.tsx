'use client';
// cache the query client
// cache the endpoint to avoid re-fetching the data
import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

type Props = {
    children: React.ReactNode;
};

const queryClient = new QueryClient();

const Providers = ({ children }: Props) => {
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

export default Providers;
