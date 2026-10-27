"use client"
import { getMyAddresses } from '@/app/actions/address.actions';
import { InitiatePaymentResult, initiatePayment } from '@/app/actions/payment.actions'
import { Tooltip, Button } from "@mui/material";
import { useRouter } from 'next/navigation';

import React from 'react'
import toast from 'react-hot-toast';

interface PaymentProps {
    orderId: number;
    addressId: number | undefined;
    variant?: "mobile" | "desktop"
}
function PaymentButton({ orderId, addressId, variant = "desktop" }: PaymentProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false);
    const handlePayment = async () => {
        setIsLoading(true);
        if (!addressId) {
            toast.error("Default shipping address not set");
            router.push("/my-account");
            return;
        }
        const payment = await initiatePayment(orderId, addressId);
        if (payment.success && payment.redirectUrl) {
            setIsLoading(false);
            window.location.href = payment.redirectUrl;
            return;
        }
        setIsLoading(false);
        toast.error(payment.message + " Your order was saved as pending.");
        router.push("/orders");
    };
    return (
        variant == "mobile" ? <Button onClick={handlePayment} fullWidth variant="outlined" className='!mt-3' loading={isLoading}>
            Continue payment
        </Button> :
            <Tooltip title="Initiate payment">
                <Button onClick={handlePayment} className="!text-xs !font-bold" loading={isLoading}>
                    Continue payment
                </Button>
            </Tooltip>
    )
}

export default PaymentButton