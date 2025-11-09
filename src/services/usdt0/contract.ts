export const OFT_ABI = [
  {
    inputs: [],
    name: "approvalRequired",
    outputs: [
      { internalType: "bool", name: "", type: "bool" }
    ],
    stateMutability: "pure",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "dstEid", type: "uint32" },
          { internalType: "bytes32", name: "to", type: "bytes32" },
          { internalType: "uint256", name: "amountLD", type: "uint256" },
          { internalType: "uint256", name: "minAmountLD", type: "uint256" },
          { internalType: "bytes", name: "extraOptions", type: "bytes" },
          { internalType: "bytes", name: "composeMsg", type: "bytes" },
          { internalType: "bytes", name: "oftCmd", type: "bytes" }
        ],
        internalType: "struct SendParam",
        name: "_sendParam",
        type: "tuple"
      }
    ],
    name: "quoteOFT",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "minAmountLD", type: "uint256" },
          { internalType: "uint256", name: "maxAmountLD", type: "uint256" }
        ],
        internalType: "struct OFTLimit",
        name: "oftLimit",
        type: "tuple"
      },
      {
        components: [
          { internalType: "int256", name: "feeAmountLD", type: "int256" },
          { internalType: "string", name: "description", type: "string" }
        ],
        internalType: "struct OFTFeeDetail[]",
        name: "oftFeeDetails",
        type: "tuple[]"
      },
      {
        components: [
          { internalType: "uint256", name: "amountSentLD", type: "uint256" },
          { internalType: "uint256", name: "amountReceivedLD", type: "uint256" }
        ],
        internalType: "struct OFTReceipt",
        name: "oftReceipt",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "dstEid", type: "uint32" },
          { internalType: "bytes32", name: "to", type: "bytes32" },
          { internalType: "uint256", name: "amountLD", type: "uint256" },
          { internalType: "uint256", name: "minAmountLD", type: "uint256" },
          { internalType: "bytes", name: "extraOptions", type: "bytes" },
          { internalType: "bytes", name: "composeMsg", type: "bytes" },
          { internalType: "bytes", name: "oftCmd", type: "bytes" }
        ],
        internalType: "struct SendParam",
        name: "_sendParam",
        type: "tuple"
      },
      { internalType: "bool", name: "_payInLzToken", type: "bool" }
    ],
    name: "quoteSend",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "nativeFee", type: "uint256" },
          { internalType: "uint256", name: "lzTokenFee", type: "uint256" }
        ],
        internalType: "struct MessagingFee",
        name: "msgFee",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "dstEid", type: "uint32" },
          { internalType: "bytes32", name: "to", type: "bytes32" },
          { internalType: "uint256", name: "amountLD", type: "uint256" },
          { internalType: "uint256", name: "minAmountLD", type: "uint256" },
          { internalType: "bytes", name: "extraOptions", type: "bytes" },
          { internalType: "bytes", name: "composeMsg", type: "bytes" },
          { internalType: "bytes", name: "oftCmd", type: "bytes" }
        ],
        internalType: "struct SendParam",
        name: "_sendParam",
        type: "tuple"
      },
      {
        components: [
          { internalType: "uint256", name: "nativeFee", type: "uint256" },
          { internalType: "uint256", name: "lzTokenFee", type: "uint256" }
        ],
        internalType: "struct MessagingFee",
        name: "_fee",
        type: "tuple"
      },
      { internalType: "address", name: "_refundAddress", type: "address" }
    ],
    name: "send",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "guid", type: "bytes32" },
          { internalType: "uint64", name: "nonce", type: "uint64" },
          {
            components: [
              { internalType: "uint256", name: "nativeFee", type: "uint256" },
              { internalType: "uint256", name: "lzTokenFee", type: "uint256" }
            ],
            internalType: "struct MessagingFee",
            name: "fee",
            type: "tuple"
          }
        ],
        internalType: "struct MessagingReceipt",
        name: "msgReceipt",
        type: "tuple"
      },
      {
        components: [
          { internalType: "uint256", name: "amountSentLD", type: "uint256" },
          { internalType: "uint256", name: "amountReceivedLD", type: "uint256" }
        ],
        internalType: "struct OFTReceipt",
        name: "oftReceipt",
        type: "tuple"
      }
    ],
    stateMutability: "payable",
    type: "function"
  }
];

export const SOLANA_IDL = {
  "extracted_idl": {
    "address": "Fuww9mfc8ntAwxPUzFia7VJFAdvLppyZwhPJoXySZXf7",
    "metadata": {
      "name": "reversed-idl",
      "version": "1.0.0",
      "spec": "0.1.0",
      "description": "Generated by solvitor"
    },
    "instructions": [
      {
        "name": "burn",
        "discriminator": [
          116,
          110,
          29,
          56,
          107,
          219,
          42,
          93
        ],
        "accounts": [
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "token_source"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "token_escrow"
          }
        ],
        "args": [
          {
            "name": "field_0",
            "type": "u32"
          },
          {
            "name": "field_1",
            "type": "pubkey"
          },
          {
            "name": "field_2",
            "type": "u64"
          },
          {
            "name": "field_3",
            "type": "pubkey"
          }
        ]
      },
      {
        "name": "deposit_local",
        "discriminator": [
          183,
          51,
          160,
          173,
          94,
          131,
          201,
          173
        ],
        "accounts": [
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "token_source"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "token_escrow"
          }
        ],
        "args": [
          {
            "name": "field_0",
            "type": "u64"
          }
        ]
      },
      {
        "name": "init_oft",
        "discriminator": [
          182,
          169,
          147,
          16,
          201,
          45,
          76,
          23
        ],
        "accounts": [
          {
            "name": "oft_store",
            "writable": true
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "token_escrow",
            "writable": true,
            "signer": true
          },
          {
            "name": "endpoint_settings"
          },
          {
            "name": "token_program"
          },
          {
            "name": "system_program"
          },
          {
            "name": "payer"
          }
        ],
        "args": []
      },
      {
        "name": "lz_receive",
        "discriminator": [
          8,
          179,
          120,
          109,
          33,
          118,
          189,
          80
        ],
        "accounts": [
          {
            "name": "token_escrow",
            "writable": true
          },
          {
            "name": "to_address"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "associated_token_program"
          },
          {
            "name": "system_program"
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "payer"
          },
          {
            "name": "peer"
          },
          {
            "name": "oft_store"
          }
        ],
        "args": []
      },
      {
        "name": "lz_receive_types_info",
        "discriminator": [
          43,
          148,
          213,
          93,
          101,
          127,
          37,
          170
        ],
        "accounts": [
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "token_source"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "token_escrow"
          }
        ],
        "args": []
      },
      {
        "name": "lz_receive_types_v2",
        "discriminator": [
          109,
          157,
          200,
          142,
          138,
          223,
          159,
          164
        ],
        "accounts": [
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "token_source"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "token_escrow"
          }
        ],
        "args": []
      },
      {
        "name": "nilify",
        "discriminator": [
          143,
          136,
          129,
          199,
          36,
          35,
          160,
          85
        ],
        "accounts": [
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "token_source"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "token_escrow"
          }
        ],
        "args": [
          {
            "name": "field_0",
            "type": "u32"
          },
          {
            "name": "field_1",
            "type": "pubkey"
          },
          {
            "name": "field_2",
            "type": "u64"
          },
          {
            "name": "field_3",
            "type": "pubkey"
          }
        ]
      },
      {
        "name": "oft_version",
        "discriminator": [
          179,
          115,
          253,
          187,
          88,
          22,
          80,
          64
        ],
        "accounts": [],
        "args": []
      },
      {
        "name": "quote_oft",
        "discriminator": [
          179,
          255,
          92,
          202,
          251,
          82,
          82,
          118
        ],
        "accounts": [
          {
            "name": "oft_store"
          },
          {
            "name": "credits"
          },
          {
            "name": "peer"
          }
        ],
        "args": []
      },
      {
        "name": "quote_send",
        "discriminator": [
          207,
          0,
          49,
          214,
          160,
          211,
          76,
          211
        ],
        "accounts": [
          {
            "name": "oft_store"
          },
          {
            "name": "credits"
          },
          {
            "name": "peer"
          }
        ],
        "args": []
      },
      {
        "name": "quote_send_credits",
        "discriminator": [
          166,
          117,
          54,
          109,
          220,
          29,
          112,
          107
        ],
        "accounts": [
          {
            "name": "oft_store"
          },
          {
            "name": "credits"
          },
          {
            "name": "peer"
          }
        ],
        "args": []
      },
      {
        "name": "quote_withdraw_remote",
        "discriminator": [
          198,
          64,
          228,
          34,
          69,
          19,
          122,
          58
        ],
        "accounts": [
          {
            "name": "oft_store"
          },
          {
            "name": "credits"
          },
          {
            "name": "peer"
          }
        ],
        "args": []
      },
      {
        "name": "send",
        "discriminator": [
          102,
          251,
          20,
          187,
          65,
          75,
          12,
          69
        ],
        "accounts": [
          {
            "name": "token_source",
            "writable": true
          },
          {
            "name": "token_escrow",
            "writable": true
          },
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "peer"
          },
          {
            "name": "oft_store",
            "writable": true
          },
          {
            "name": "credits",
            "writable": true
          }
        ],
        "args": []
      },
      {
        "name": "send_credits",
        "discriminator": [
          92,
          161,
          204,
          14,
          139,
          189,
          105,
          227
        ],
        "accounts": [
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "planner"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "peer"
          }
        ],
        "args": []
      },
      {
        "name": "set_oft_config",
        "discriminator": [
          55,
          126,
          87,
          217,
          159,
          66,
          24,
          194
        ],
        "accounts": [
          {
            "name": "peer",
            "writable": true
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "admin"
          },
          {
            "name": "oft_store"
          }
        ],
        "args": [
          {
            "name": "field_0",
            "type": "u8"
          },
          {
            "name": "field_1",
            "type": "pubkey"
          }
        ]
      },
      {
        "name": "set_peer_config",
        "discriminator": [
          79,
          187,
          168,
          57,
          139,
          140,
          93,
          47
        ],
        "accounts": [
          {
            "name": "peer",
            "writable": true
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "admin"
          },
          {
            "name": "oft_store"
          }
        ],
        "args": []
      },
      {
        "name": "withdraw_fees",
        "discriminator": [
          198,
          212,
          171,
          109,
          144,
          215,
          174,
          89
        ],
        "accounts": [
          {
            "name": "token_dest",
            "writable": true
          },
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "admin"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "token_escrow"
          }
        ],
        "args": [
          {
            "name": "field_0",
            "type": "u64"
          }
        ]
      },
      {
        "name": "withdraw_local",
        "discriminator": [
          112,
          250,
          134,
          10,
          96,
          9,
          236,
          176
        ],
        "accounts": [
          {
            "name": "token_dest",
            "writable": true
          },
          {
            "name": "token_mint"
          },
          {
            "name": "token_program"
          },
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "admin"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "token_escrow"
          }
        ],
        "args": [
          {
            "name": "field_0",
            "type": "u64"
          }
        ]
      },
      {
        "name": "withdraw_remote",
        "discriminator": [
          135,
          200,
          45,
          240,
          165,
          104,
          44,
          102
        ],
        "accounts": [
          {
            "name": "event_authority"
          },
          {
            "name": "program"
          },
          {
            "name": "admin"
          },
          {
            "name": "oft_store"
          },
          {
            "name": "credits",
            "writable": true
          },
          {
            "name": "peer"
          }
        ],
        "args": []
      }
    ],
    "accounts": [
      {
        "name": "EndpointSettings",
        "discriminator": [
          221,
          232,
          73,
          56,
          10,
          66,
          72,
          14
        ]
      }
    ],
    "types": [
      {
        "name": "EndpointSettings",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "field_0",
              "type": "u32"
            },
            {
              "name": "field_1",
              "type": "u8"
            },
            {
              "name": "field_2",
              "type": "pubkey"
            },
            {
              "name": "field_3",
              "type": "u8"
            }
          ]
        }
      }
    ]
  },
  "has_public_idl": false,
  "is_native": false,
  "name": "reversed-idl",
  "instructions": [
    {
      "accounts": [
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "token_source"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "token_escrow"
        }
      ],
      "args": [
        {
          "name": "field_0",
          "type": "u32"
        },
        {
          "name": "field_1",
          "type": "pubkey"
        },
        {
          "name": "field_2",
          "type": "u64"
        },
        {
          "name": "field_3",
          "type": "pubkey"
        }
      ],
      "discriminator": [
        116,
        110,
        29,
        56,
        107,
        219,
        42,
        93
      ],
      "name": "burn"
    },
    {
      "accounts": [
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "token_source"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "token_escrow"
        }
      ],
      "args": [
        {
          "name": "field_0",
          "type": "u64"
        }
      ],
      "discriminator": [
        183,
        51,
        160,
        173,
        94,
        131,
        201,
        173
      ],
      "name": "deposit_local"
    },
    {
      "accounts": [
        {
          "name": "oft_store",
          "writable": true
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "token_escrow",
          "signer": true,
          "writable": true
        },
        {
          "name": "endpoint_settings"
        },
        {
          "name": "token_program"
        },
        {
          "name": "system_program"
        },
        {
          "name": "payer"
        }
      ],
      "args": [],
      "discriminator": [
        182,
        169,
        147,
        16,
        201,
        45,
        76,
        23
      ],
      "name": "init_oft"
    },
    {
      "accounts": [
        {
          "name": "token_escrow",
          "writable": true
        },
        {
          "name": "to_address"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "associated_token_program"
        },
        {
          "name": "system_program"
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "payer"
        },
        {
          "name": "peer"
        },
        {
          "name": "oft_store"
        }
      ],
      "args": [],
      "discriminator": [
        8,
        179,
        120,
        109,
        33,
        118,
        189,
        80
      ],
      "name": "lz_receive"
    },
    {
      "accounts": [
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "token_source"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "token_escrow"
        }
      ],
      "args": [],
      "discriminator": [
        43,
        148,
        213,
        93,
        101,
        127,
        37,
        170
      ],
      "name": "lz_receive_types_info"
    },
    {
      "accounts": [
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "token_source"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "token_escrow"
        }
      ],
      "args": [],
      "discriminator": [
        109,
        157,
        200,
        142,
        138,
        223,
        159,
        164
      ],
      "name": "lz_receive_types_v2"
    },
    {
      "accounts": [
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "token_source"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "token_escrow"
        }
      ],
      "args": [
        {
          "name": "field_0",
          "type": "u32"
        },
        {
          "name": "field_1",
          "type": "pubkey"
        },
        {
          "name": "field_2",
          "type": "u64"
        },
        {
          "name": "field_3",
          "type": "pubkey"
        }
      ],
      "discriminator": [
        143,
        136,
        129,
        199,
        36,
        35,
        160,
        85
      ],
      "name": "nilify"
    },
    {
      "accounts": [],
      "args": [],
      "discriminator": [
        179,
        115,
        253,
        187,
        88,
        22,
        80,
        64
      ],
      "name": "oft_version"
    },
    {
      "accounts": [
        {
          "name": "oft_store"
        },
        {
          "name": "credits"
        },
        {
          "name": "peer"
        }
      ],
      "args": [],
      "discriminator": [
        179,
        255,
        92,
        202,
        251,
        82,
        82,
        118
      ],
      "name": "quote_oft"
    },
    {
      "accounts": [
        {
          "name": "oft_store"
        },
        {
          "name": "credits"
        },
        {
          "name": "peer"
        }
      ],
      "args": [],
      "discriminator": [
        207,
        0,
        49,
        214,
        160,
        211,
        76,
        211
      ],
      "name": "quote_send"
    },
    {
      "accounts": [
        {
          "name": "oft_store"
        },
        {
          "name": "credits"
        },
        {
          "name": "peer"
        }
      ],
      "args": [],
      "discriminator": [
        166,
        117,
        54,
        109,
        220,
        29,
        112,
        107
      ],
      "name": "quote_send_credits"
    },
    {
      "accounts": [
        {
          "name": "oft_store"
        },
        {
          "name": "credits"
        },
        {
          "name": "peer"
        }
      ],
      "args": [],
      "discriminator": [
        198,
        64,
        228,
        34,
        69,
        19,
        122,
        58
      ],
      "name": "quote_withdraw_remote"
    },
    {
      "accounts": [
        {
          "name": "token_source",
          "writable": true
        },
        {
          "name": "token_escrow",
          "writable": true
        },
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "peer"
        },
        {
          "name": "oft_store",
          "writable": true
        },
        {
          "name": "credits",
          "writable": true
        }
      ],
      "args": [],
      "discriminator": [
        102,
        251,
        20,
        187,
        65,
        75,
        12,
        69
      ],
      "name": "send"
    },
    {
      "accounts": [
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "planner"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "peer"
        }
      ],
      "args": [],
      "discriminator": [
        92,
        161,
        204,
        14,
        139,
        189,
        105,
        227
      ],
      "name": "send_credits"
    },
    {
      "accounts": [
        {
          "name": "peer",
          "writable": true
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "admin"
        },
        {
          "name": "oft_store"
        }
      ],
      "args": [
        {
          "name": "field_0",
          "type": "u8"
        },
        {
          "name": "field_1",
          "type": "pubkey"
        }
      ],
      "discriminator": [
        55,
        126,
        87,
        217,
        159,
        66,
        24,
        194
      ],
      "name": "set_oft_config"
    },
    {
      "accounts": [
        {
          "name": "peer",
          "writable": true
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "admin"
        },
        {
          "name": "oft_store"
        }
      ],
      "args": [],
      "discriminator": [
        79,
        187,
        168,
        57,
        139,
        140,
        93,
        47
      ],
      "name": "set_peer_config"
    },
    {
      "accounts": [
        {
          "name": "token_dest",
          "writable": true
        },
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "admin"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "token_escrow"
        }
      ],
      "args": [
        {
          "name": "field_0",
          "type": "u64"
        }
      ],
      "discriminator": [
        198,
        212,
        171,
        109,
        144,
        215,
        174,
        89
      ],
      "name": "withdraw_fees"
    },
    {
      "accounts": [
        {
          "name": "token_dest",
          "writable": true
        },
        {
          "name": "token_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "admin"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "token_escrow"
        }
      ],
      "args": [
        {
          "name": "field_0",
          "type": "u64"
        }
      ],
      "discriminator": [
        112,
        250,
        134,
        10,
        96,
        9,
        236,
        176
      ],
      "name": "withdraw_local"
    },
    {
      "accounts": [
        {
          "name": "event_authority"
        },
        {
          "name": "program"
        },
        {
          "name": "admin"
        },
        {
          "name": "oft_store"
        },
        {
          "name": "credits",
          "writable": true
        },
        {
          "name": "peer"
        }
      ],
      "args": [],
      "discriminator": [
        135,
        200,
        45,
        240,
        165,
        104,
        44,
        102
      ],
      "name": "withdraw_remote"
    }
  ],
  "accounts": [
    {
      "discriminator": [
        221,
        232,
        73,
        56,
        10,
        66,
        72,
        14
      ],
      "name": "EndpointSettings"
    }
  ],
  "types": [
    {
      "name": "EndpointSettings",
      "type": {
        "fields": [
          {
            "name": "field_0",
            "type": "u32"
          },
          {
            "name": "field_1",
            "type": "u8"
          },
          {
            "name": "field_2",
            "type": "pubkey"
          },
          {
            "name": "field_3",
            "type": "u8"
          }
        ],
        "kind": "struct"
      }
    }
  ],
  "metadata": {
    "description": "Generated by solvitor",
    "name": "reversed-idl",
    "spec": "0.1.0",
    "version": "1.0.0"
  },
  "version": "1.0.0"
};
