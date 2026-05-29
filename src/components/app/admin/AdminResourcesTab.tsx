import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { ResourceSummaryCards } from "./ResourceSummaryCards";
import { FloorsTable } from "./FloorsTable";
import { ZonesTable } from "./ZonesTable";
import { DesksTable } from "./DesksTable";
import { RoomsTable } from "./RoomsTable";

export function AdminResourcesTab() {
  return (
    <div className="space-y-6">
      <ResourceSummaryCards />

      <Accordion type="single" collapsible defaultValue="desks">
        <AccordionItem value="floors">
          <AccordionTrigger>Floors</AccordionTrigger>
          <AccordionContent><FloorsTable /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="zones">
          <AccordionTrigger>Zones</AccordionTrigger>
          <AccordionContent><ZonesTable /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="desks">
          <AccordionTrigger>Desks</AccordionTrigger>
          <AccordionContent><DesksTable /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="rooms">
          <AccordionTrigger>Rooms</AccordionTrigger>
          <AccordionContent><RoomsTable /></AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
