import { IconButtonProps, IconButton, Tooltip } from "@mui/material";

export const TooltipButton = (props: IconButtonProps & { title: string }) => {
  const buttonProps: IconButtonProps = { ...props };
  delete buttonProps.title;

  return (
    <Tooltip title={props.title}>
      <IconButton {...buttonProps}>{props.children}</IconButton>
    </Tooltip>
  );
};
