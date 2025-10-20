import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import type { SankeyNode, SankeyLink } from 'd3-sankey';
import { usdtChains } from '@/config/tokens/usdt';
import MultiSelect from '@/components/multi-select';

interface CustomSankeyNode extends SankeyNode<any, any> {
  id: string;
  name: string;
  color: string;
}

interface CustomSankeyLink extends SankeyLink<any, any> {
  source: string;
  target: string;
  value: number;
}

const Sankey = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [selectedLeftChains, setSelectedLeftChains] = useState<string[]>(['eth', 'arb', 'pol', 'bsc', 'avax']);
  const [selectedRightChains, setSelectedRightChains] = useState<string[]>(['eth', 'arb', 'pol', 'bsc', 'avax']);

  // Function to update dimensions based on container size
  const updateDimensions = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newWidth = Math.max(600, containerWidth); // Use full container width, minimum 600px
      const newHeight = Math.max(300, newWidth * 0.4); // Height proportional to width
      setDimensions({ width: newWidth, height: newHeight });
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize);
    updateDimensions(); // Initial call

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set SVG dimensions
    const { width, height } = dimensions;
    const margin = { top: 5, right: 5, bottom: 5, left: 5 };

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#ffffff");

    // Get selected chains
    const leftChains = selectedLeftChains.map(key => ({
      key,
      ...usdtChains[key as keyof typeof usdtChains]
    }));
    const rightChains = selectedRightChains.map(key => ({
      key,
      ...usdtChains[key as keyof typeof usdtChains]
    }));
    
    // Check if we have at least one chain on each side
    if (leftChains.length === 0 || rightChains.length === 0) {
      // Show empty state message
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#9FA7BA")
        .attr("font-size", "14px")
        .text("Please select at least one chain on each side");
      return;
    }
    
    // Define link data - connect all left chains to all right chains
    const links: CustomSankeyLink[] = [];
    leftChains.forEach(leftChain => {
      rightChains.forEach(rightChain => {
        // Only connect different chains
        if (leftChain.key !== rightChain.key) {
          links.push({
            source: `${leftChain.key}-src`,
            target: `${rightChain.key}-tgt`,
            value: Math.floor(Math.random() * 50) + 10 // Random flow value between 10-60
          });
        }
      });
    });

    // Check if we have any valid connections
    if (links.length === 0) {
      // Show message when no valid connections exist
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#9FA7BA")
        .attr("font-size", "14px")
        .text("No valid connections between selected chains");
      return;
    }

    // Get unique nodes that have connections
    const connectedNodeIds = new Set<string>();
    links.forEach(link => {
      connectedNodeIds.add(link.source);
      connectedNodeIds.add(link.target);
    });

    // Define node data - only include nodes that have connections
    const nodes: CustomSankeyNode[] = [];
    
    // Add source nodes that have outgoing connections
    leftChains.forEach(chain => {
      const hasOutgoing = links.some(link => link.source === `${chain.key}-src`);
      if (hasOutgoing) {
        nodes.push({
          id: `${chain.key}-src`,
          name: chain.chainName,
          color: chain.primaryColor
        });
      }
    });

    // Add target nodes that have incoming connections
    rightChains.forEach(chain => {
      const hasIncoming = links.some(link => link.target === `${chain.key}-tgt`);
      if (hasIncoming) {
        nodes.push({
          id: `${chain.key}-tgt`,
          name: chain.chainName,
          color: chain.primaryColor
        });
      }
    });

    // Create Sankey diagram layout
    const sankeyGenerator = sankey<CustomSankeyNode, CustomSankeyLink>()
      .nodeId((d: CustomSankeyNode) => d.id)
      .nodeWidth(20)
      .nodePadding(10)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    });

    // Create gradient definitions
    const defs = svg.append("defs");

    // Create gradients for each node
    sankeyNodes.forEach((node: any) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${node.id}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", 1);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", node.color)
        .attr("stop-opacity", 0.8);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", node.color)
        .attr("stop-opacity", 0.4);
    });

    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "sankey-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)");

    // Calculate link width scale
    const allValues = links.map(d => d.value);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const widthScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([3, 12]); // Min width 1px, max width 12px

    // Draw links
    const link = svg.append("g")
      .selectAll("path")
      .data(sankeyLinks)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d: any) => {
        const sourceNode = sankeyNodes.find((n: any) => n.id === d.source.id);
        return sourceNode ? sourceNode.color : "#999";
      })
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: any) => {
        // Use scale to calculate width, ensuring width reflects value
        return Math.max(1, widthScale(d.value));
      });

    // Draw nodes
    const node = svg.append("g")
      .selectAll("rect")
      .data(sankeyNodes)
      .join("rect")
      .attr("x", (d: any) => d.x0!)
      .attr("y", (d: any) => d.y0!)
      .attr("height", (d: any) => d.y1! - d.y0!)
      .attr("width", (d: any) => d.x1! - d.x0!)
      .attr("fill", (d: any) => `url(#gradient-${d.id})`)
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("ry", 4);

    // Add node labels
    svg.append("g")
      .selectAll("text")
      .data(sankeyNodes)
      .join("text")
      .attr("x", (d: any) => {
        // Left side node labels positioned inside the node
        if (d.x0! < width / 2) {
          return d.x0! + 25;
        } else {
          // Right side node labels positioned inside the node
          return d.x1! - 25;
        }
      })
      .attr("y", (d: any) => (d.y0! + d.y1!) / 2)
      .attr("text-anchor", (d: any) => d.x0! < width / 2 ? "start" : "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#2B3337")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text((d: any) => d.name);

    // Add hover effects
    node
      .on("mouseover", function (event, d: any) {
        d3.select(this)
          .attr("stroke", "#2B3337")
          .attr("stroke-width", 2);

        // Highlight related connections
        link
          .attr("stroke-opacity", (l: any) =>
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
          );

        // Calculate total inflow and outflow
        const outgoingLinks = sankeyLinks.filter((l: any) => l.source.id === d.id);
        const incomingLinks = sankeyLinks.filter((l: any) => l.target.id === d.id);
        const totalOut = outgoingLinks.reduce((sum: number, l: any) => sum + l.value, 0);
        const totalIn = incomingLinks.reduce((sum: number, l: any) => sum + l.value, 0);

        // For left side nodes, inflow should be the same as the corresponding right side node's inflow
        // For right side nodes, outflow should be the same as the corresponding left side node's outflow
        const isLeftSide = d.id.includes('-src');
        let displayInflow, displayOutflow;

        if (isLeftSide) {
          // Left side: find corresponding right side node
          const rightSideId = d.id.replace('-src', '-tgt');
          const rightSideIncomingLinks = sankeyLinks.filter((l: any) => l.target.id === rightSideId);
          const rightSideInflow = rightSideIncomingLinks.reduce((sum: number, l: any) => sum + l.value, 0);

          displayInflow = rightSideInflow; // Left side inflow = right side inflow
          displayOutflow = totalOut; // Left side outflow = its own outflow
        } else {
          // Right side: find corresponding left side node
          const leftSideId = d.id.replace('-tgt', '-src');
          const leftSideOutgoingLinks = sankeyLinks.filter((l: any) => l.source.id === leftSideId);
          const leftSideOutflow = leftSideOutgoingLinks.reduce((sum: number, l: any) => sum + l.value, 0);

          displayInflow = totalIn; // Right side inflow = its own inflow
          displayOutflow = leftSideOutflow; // Right side outflow = left side outflow
        }

        // Show node tooltip
        tooltip
          .style("opacity", 1)
          .html(`
            <div style="text-align: center;">
              <div style="font-weight: 600; margin-bottom: 6px; color: #fff;">
                ${d.name}
              </div>
              <div style="color: #ccc; font-size: 11px; margin-bottom: 2px;">
                Inflow: ${displayInflow} units
              </div>
              <div style="color: #ccc; font-size: 11px;">
                Outflow: ${displayOutflow} units
              </div>
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function (event) {
        // Follow mouse movement
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function (_, d: any) {
        d3.select(this)
          .attr("stroke", d.color)
          .attr("stroke-width", 1);

        // Restore all connections
        link.attr("stroke-opacity", 0.6);

        // Hide tooltip
        tooltip.style("opacity", 0);
      });

    link
      .on("mouseover", function (event, d: any) {
        // Highlight link
        d3.select(this)
          .attr("stroke-width", widthScale(d.value) + 2)
          .attr("stroke-opacity", 1);

        // Get source and target node information
        const sourceNode = sankeyNodes.find((n: any) => n.id === d.source.id);
        const targetNode = sankeyNodes.find((n: any) => n.id === d.target.id);

        // Show tooltip
        tooltip
          .style("opacity", 1)
          .html(`
            <div style="text-align: center;">
              <div style="font-weight: 600; margin-bottom: 4px; color: #fff;">
                ${sourceNode?.name} → ${targetNode?.name}
              </div>
              <div style="color: #ccc; font-size: 11px;">
                Flow: ${d.value} units
              </div>
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function (event) {
        // Follow mouse movement
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function (_, d: any) {
        // Restore link style
        d3.select(this)
          .attr("stroke-width", widthScale(d.value))
          .attr("stroke-opacity", 0.6);

        // Hide tooltip
        tooltip.style("opacity", 0);
      });

  }, [dimensions, selectedLeftChains, selectedRightChains]);

  // Get available chains for selection
  const availableChains = Object.entries(usdtChains).map(([key, chain]) => ({
    key,
    name: chain.chainName,
    color: chain.primaryColor
  }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-[12px]">
        <div className="text-[16px] font-[500] text-[#0E3616]">
          Analytics Flow
        </div>
        <div className="flex items-center gap-[16px]">
          {/* Left Chains Selector */}
          <MultiSelect
            options={availableChains}
            selectedValues={selectedLeftChains}
            onChange={setSelectedLeftChains}
            label="From"
            placeholder="Select source chains"
            className="min-w-[160px]"
            minSelections={1}
          />
          
          {/* Right Chains Selector */}
          <MultiSelect
            options={availableChains}
            selectedValues={selectedRightChains}
            onChange={setSelectedRightChains}
            label="To"
            placeholder="Select target chains"
            className="min-w-[160px]"
            minSelections={1}
          />
        </div>
      </div>
      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]">
        <div ref={containerRef} className="w-full">
          <svg 
            ref={svgRef} 
            className="w-full h-auto"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          ></svg>
        </div>
      </div>
    </div>
  );
};

export default Sankey;
