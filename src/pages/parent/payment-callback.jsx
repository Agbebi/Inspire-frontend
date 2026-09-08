import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircleIcon, XCircleIcon, LoaderCircleIcon } from "lucide-react"
import parentAPI from "@/api/parent"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatNaira } from "@/lib/utils"

export default function PaymentCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const reference = searchParams.get("reference")
    const [status, setStatus] = useState(reference ? "verifying" : "failed")
    const [detail, setDetail] = useState(null)

    useEffect(() => {
        if (!reference) {
            return
        }

        parentAPI
            .get(`/parent/fees/payments/verify/${reference}`)
            .then((res) => {
                const data = res.data?.data
                setStatus(data?.status === "success" ? "success" : "failed")
                setDetail(data)
            })
            .catch(() => {
                setStatus("failed")
            })
    }, [reference])

    function formatCurrency(amountInKobo) {
        return formatNaira(amountInKobo)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
            <Card className="mx-4 max-w-md p-8 text-center">
                {status === "verifying" && (
                    <>
                        <LoaderCircleIcon className="mx-auto mb-4 size-10 animate-spin text-brand" />
                        <h2 className="text-xl font-semibold text-foreground">
                            Verifying your payment…
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Please wait while we confirm your transaction with Paystack.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircleIcon className="mx-auto mb-4 size-10 text-green-500" />
                        <h2 className="text-xl font-semibold text-foreground">
                            Payment Successful!
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Your fees have been paid and a record has been saved.
                        </p>
                        {detail && (
                            <div className="mt-4 space-y-1 text-sm">
                                <p>
                                    <span className="text-muted-foreground">Amount:</span>{" "}
                                    <span className="font-medium text-foreground">
                                        {formatCurrency(detail.amount)}
                                    </span>
                                </p>
                                {detail.feeTitle && (
                                    <p>
                                        <span className="text-muted-foreground">Fee:</span>{" "}
                                        <span className="font-medium text-foreground">
                                            {detail.feeTitle}
                                        </span>
                                    </p>
                                )}
                                {detail.paidAt && (
                                    <p>
                                        <span className="text-muted-foreground">Paid at:</span>{" "}
                                        <span className="font-medium text-foreground">
                                            {new Date(detail.paidAt).toLocaleString()}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                        <Button
                            className="mt-6 w-full gap-2"
                            onClick={() => navigate(-1)}
                        >
                            Back to Fees
                        </Button>
                    </>
                )}

                {status === "failed" && (
                    <>
                        <XCircleIcon className="mx-auto mb-4 size-10 text-red-500" />
                        <h2 className="text-xl font-semibold text-foreground">
                            Payment Could Not Be Verified
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            We could not confirm this payment. Please check your payment
                            history or try again.
                        </p>
                        <Button
                            className="mt-6 w-full"
                            variant="outline"
                            onClick={() => navigate(-1)}
                        >
                            Back to Fees
                        </Button>
                    </>
                )}
            </Card>
        </div>
    )
}
