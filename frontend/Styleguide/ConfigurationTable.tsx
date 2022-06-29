import { Fragment, ReactNode } from "react";
import { Button, ButtonKind } from "./Button";

export function ConfigurationTable(props: ConfigurationTableProps) {
  return (
    <table className="text-sm">
      <tbody>
        {props.sections.map((section) => (
          <Fragment key={section.label}>
            <tr className="border-b">
              <td className="font-bold w-60">{section.label}</td>
              <td />
            </tr>
            {section.items.map((item, i) => {
              const isSection = item.hasOwnProperty("items");
              let secondColumn: ReactNode;
              let extraRows: ReactNode[] = [];

              if (isSection) {
                const section = item as Section;
                secondColumn = <td></td>;
                extraRows = section.items.map((item, index) => {
                  const sectionItem = item as SectionItem;
                  return (
                    <tr className="border-b" key={index}>
                      <td className="pl-8 w-60">{sectionItem.label}</td>
                      <td className="text-gray-600 flex items-center">
                        <div>{sectionItem.element}</div>
                        {sectionItem.editable && (
                          <Button
                            className="ml-4"
                            type="button"
                            kind={ButtonKind.classic}
                            onClick={sectionItem.handleEdit}
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                });
              } else {
                const sectionItem = item as SectionItem;
                secondColumn = (
                  <td className="text-gray-600 flex items-center">
                    <div>{sectionItem.element}</div>
                    {sectionItem.editable && (
                      <Button
                        className="ml-4"
                        type="button"
                        kind={ButtonKind.classic}
                        onClick={sectionItem.handleEdit}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                );
              }

              return (
                <Fragment key={i}>
                  <tr className="border-b" key={item.label}>
                    <td className="pl-4">{item.label}</td>
                    {secondColumn}
                  </tr>
                  {extraRows}
                </Fragment>
              );
            })}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

export interface ConfigurationTableProps {
  sections: Section[];
}

interface Section {
  label: string;
  items: (SectionItem | Section)[];
}

type SectionItem = NonEditableItem | EditableItem;

interface NonEditableItem {
  label: string;
  element: ReactNode;
  editable?: false;
}

interface EditableItem {
  label: string;
  element: ReactNode;
  editable: true;
  handleEdit(): any;
}
