"use client"

import React, { useState, useRef, useTransition } from "react";
import { grey, red, green } from '@mui/material/colors';
import Edit from "@mui/icons-material/Edit";
import IconButton from '@mui/material/IconButton';
import Close from "@mui/icons-material/Close";
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import { useClickOutside } from '@/context/GlobalEventProvider';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/profile.actions";

/** Editable profile fields handled by this row. */
type ProfileField = "bio" | "phone" | "avatar_url";

/**
 * A single profile field with inline edit.
 *
 * `field` is the backend key this row maps to (e.g. "bio", "phone"). On save it
 * calls updateProfile with just that field, so each row persists independently
 * to PUT /users/me/profile. Non-editable rows (email, age) render read-only.
 */
function ProfileItem({
    name,
    value,
    editable,
    field,
}: {
    name: string;
    value: string;
    editable: boolean;
    /** Backend profile key; required when editable. */
    field?: ProfileField;
}) {
    const router = useRouter();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [draft, setDraft] = useState<string>(value);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    // Ref wraps the WHOLE editing row (input + action buttons) so clicks on the
    // check/X buttons count as "inside" and don't trigger the outside-cancel.
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close (cancel) when clicking away, unless a save is in flight.
    useClickOutside(containerRef, () => {
        if (isEdit && !pending) cancel();
    });

    const editClick = () => {
        setDraft(value);
        setError(null);
        setIsEdit(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    function cancel() {
        setIsEdit(false);
        setError(null);
        setDraft(value);
    }

    function save() {
        if (!field) return;
        if (draft === value) {
            setIsEdit(false);
            return;
        }
        setError(null);
        startTransition(async () => {
            const result = await updateProfile({ [field]: draft });
            if (result.success) {
                setIsEdit(false);
                router.refresh();
            } else {
                // Prefer a field-specific message when the backend gives one.
                const fieldMsg = field && result.fieldErrors?.[field]?.join(" ");
                setError(fieldMsg || result.message);
            }
        });
    }

    return (
        <div ref={containerRef} className="flex flex-wrap items-center justify-left">
            {!isEdit ? (
                <>
                    <div className="relative w-30 pr-4 block text-sm font-medium text-gray-800 after:content-[':'] after:text-gray-500 after:absolute after:right-0 after:top-0 mr-2">{name}</div>
                    <div className=" text-gray-800  mr-1">{value}</div>
                    {editable && (
                        <IconButton aria-label="edit" color="primary" onClick={editClick}>
                            <Edit sx={{ color: grey[600] }} />
                        </IconButton>
                    )}
                </>
            ) : (
                <>
                    <label htmlFor={`${name}-input`} className="relative w-30 pr-4 block text-sm font-medium text-gray-800 after:content-[':'] after:text-gray-500 after:absolute after:right-0 after:top-0 mr-2">
                        {name}
                    </label>
                    <FormControl sx={{ m: 1, width: '35ch' }} variant="standard">
                        <Input
                            inputRef={inputRef}
                            id={`${name}-input`}
                            type={'text'}
                            value={draft}
                            disabled={pending}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') save();
                                if (e.key === 'Escape') cancel();
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    {pending ? (
                                        <CircularProgress size={18} />
                                    ) : (
                                        <>
                                            <IconButton
                                                aria-label="save"
                                                color="success"
                                                onMouseDown={(e) => {
                                                    // Run before the global mousedown "click-outside" so
                                                    // the save isn't pre-empted by a cancel.
                                                    e.preventDefault();
                                                    save();
                                                }}
                                            >
                                                <CheckIcon sx={{ color: green[300] }} />
                                            </IconButton>
                                            <IconButton
                                                aria-label="cancel"
                                                color="error"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    cancel();
                                                }}
                                            >
                                                <Close sx={{ color: red[300] }} />
                                            </IconButton>
                                        </>
                                    )}
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                    {error && (
                        <p role="alert" className="w-full text-xs text-rose-600 mt-1">
                            {error}
                        </p>
                    )}
                </>
            )}
        </div>
    )
}

export default ProfileItem
