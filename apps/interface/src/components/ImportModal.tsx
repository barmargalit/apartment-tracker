"use client";

import {useState} from "react";
import {Button, Form, Modal, Select, Upload, message} from "antd";
import {InboxOutlined} from "@ant-design/icons";
import type {UploadFile} from "antd";
import {BillType} from "@apartment-tracker/types";
import {BILL_TYPE_OPTIONS} from "@/lib/billTypes";
import {useUsagesStore} from "@/store/usagesStore";
import {CreateUsagePayload} from "@/api/usagesApi";

const {Dragger} = Upload;

interface ImportModalProps {
    open: boolean;
    onClose: () => void;
    defaultType?: BillType;
}

function parseCSV(text: string, type: BillType): CreateUsagePayload[] {
    const lines = text.trim().split("\n").filter(Boolean);
    // skip optional header row if first cell isn't a date-shaped value
    const dataLines = /^\d{2}\/\d{2}\/\d{4}/.test(lines[0].trim()) ? lines : lines.slice(1);
    return dataLines.map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        if (cols.length < 3) return null;
        const [day, time, usageRaw] = cols;
        // day: DD/MM/YYYY → YYYY-MM-DD
        const [dd, mm, yyyy] = day.split("/");
        if (!dd || !mm || !yyyy) return null;
        const paddedTime = time.includes(":") ? time.replace(/^(\d):/, "0$1:") : time;
        const datetime = `${yyyy}-${mm}-${dd}T${paddedTime}:00`;
        const usage = parseFloat(usageRaw);
        if (isNaN(usage) || isNaN(Date.parse(datetime))) return null;
        return {datetime, usage, type};
    }).filter((row): row is CreateUsagePayload => row !== null);
}

export default function ImportModal({open, onClose, defaultType}: ImportModalProps) {
    const [billType, setBillType] = useState<BillType | undefined>(defaultType);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const {createMany} = useUsagesStore();

    const handleClose = () => {
        setFileList([]);
        onClose();
    };

    const handleImport = async () => {
        if (!billType || fileList.length === 0) return;
        const file = fileList[0].originFileObj as File;
        const text = await file.text();
        const rows = parseCSV(text, billType);
        if (rows.length === 0) {
            message.error("No valid rows found. CSV must have 'datetime' and 'usage' columns.");
            return;
        }
        setLoading(true);
        try {
            await createMany(rows);
            message.success(`Imported ${rows.length} entries`);
            handleClose();
        } catch {
            message.error("Import failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Import"
            open={open}
            onCancel={handleClose}
            afterOpenChange={(visible) => {
                if (visible) {
                    setBillType(defaultType);
                    setFileList([]);
                }
            }}
            footer={
                <Button
                    type="primary"
                    loading={loading}
                    disabled={!billType || fileList.length === 0}
                    onClick={handleImport}
                >
                    Import
                </Button>
            }
        >
            <Form layout="vertical" style={{marginTop: 16}}>
                <Form.Item label="Bill Type">
                    <Select
                        options={BILL_TYPE_OPTIONS}
                        value={billType}
                        onChange={setBillType}
                        placeholder="Select bill type"
                    />
                </Form.Item>
                <Form.Item>
                    <Dragger
                        accept=".csv"
                        multiple={false}
                        beforeUpload={() => false}
                        fileList={fileList}
                        onChange={({fileList: list}) => setFileList(list.slice(-1))}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">Click or drag a CSV file to upload</p>
                        <p className="ant-upload-hint">Columns: date (DD/MM/YYYY), time (HH:MM), usage</p>
                    </Dragger>
                </Form.Item>
            </Form>
        </Modal>
    );
}
