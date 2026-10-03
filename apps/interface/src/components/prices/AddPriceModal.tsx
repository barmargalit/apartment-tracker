"use client";

import {useEffect} from "react";
import {DatePicker, Form, Input, InputNumber, Modal} from "antd";
import dayjs from "dayjs";
import {BillType, PriceHistory} from "@xpensive/types";
import {usePricesStore} from "@/store/pricesStore";
import ProviderSelect from "@/components/providers/ProviderSelect";

interface Props {
    open: boolean;
    billType: BillType;
    editRecord?: PriceHistory | null;
    onClose: () => void;
}

interface FormValues {
    price: number;
    provider_id?: string;
    valid_from?: ReturnType<typeof dayjs>;
    comment?: string;
}

export default function AddPriceModal({open, billType, editRecord, onClose}: Props) {
    const [form] = Form.useForm<FormValues>();
    const {upsertPrice, updateHistoryPrice} = usePricesStore();
    const isEdit = !!editRecord;

    useEffect(() => {
        if (open && editRecord) {
            form.setFieldsValue({
                price: Number(editRecord.price),
                provider_id: editRecord.provider_id ?? undefined,
                valid_from: dayjs(editRecord.valid_from),
                comment: editRecord.comment ?? undefined,
            });
        } else if (open) {
            form.resetFields();
        }
    }, [open, editRecord]);

    const handleOk = async () => {
        const values = await form.validateFields();
        if (isEdit && editRecord) {
            await updateHistoryPrice(editRecord.id, billType, {
                price: values.price,
                provider_id: values.provider_id ?? null,
                valid_from: values.valid_from?.toISOString(),
                comment: values.comment ?? null,
            });
        } else {
            await upsertPrice({
                type: billType,
                price: values.price,
                provider_id: values.provider_id ?? null,
                valid_from: values.valid_from?.toISOString(),
                comment: values.comment ?? null,
            });
        }
        form.resetFields();
        onClose();
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={isEdit ? "Edit Price" : "Add Price"}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Save"
            destroyOnHidden
        >
            <Form form={form} layout="vertical" style={{marginTop: 16}}>
                <Form.Item
                    name="price"
                    label="Price"
                    rules={[{required: true, message: "Please enter a price"}]}
                >
                    <InputNumber
                        style={{width: "100%"}}
                        min={0}
                        step={0.0001}
                        precision={4}
                        placeholder="e.g. 0.5343"
                    />
                </Form.Item>
                <Form.Item name="provider_id" label="Provider">
                    <ProviderSelect billType={billType} allowClear placeholder="Select provider" />
                </Form.Item>
                <Form.Item name="valid_from" label="Date set">
                    <DatePicker
                        style={{width: "100%"}}
                        format="DD/MM/YY"
                        disabledDate={(d) => d.isAfter(dayjs(), "day")}
                        placeholder="Today"
                    />
                </Form.Item>
                <Form.Item name="comment" label="Comment">
                    <Input.TextArea rows={2} placeholder="Optional note" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
