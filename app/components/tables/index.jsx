import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width: screenWidth } = Dimensions.get("window");

// Custom hook for table functionality
const useTable = (data, columns, options = {}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(
    options.initialState?.pageSize || 10
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sortBy, setSortBy] = useState([]);

  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }, [data, globalFilter]);

  const sortedData = useMemo(() => {
    if (sortBy.length === 0) return filteredData;
    const { id, desc } = sortBy[0];
    return [...filteredData].sort((a, b) => {
      const aVal = a[id];
      const bVal = b[id];
      if (desc) {
        return aVal < bVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }, [filteredData, sortBy]);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return {
    data: paginatedData,
    allData: sortedData,
    currentPage,
    pageSize,
    totalPages,
    globalFilter,
    sortBy,
    setCurrentPage,
    setPageSize,
    setGlobalFilter,
    setSortBy,
    canPreviousPage: currentPage > 0,
    canNextPage: currentPage < totalPages - 1,
    gotoPage: (page) =>
      setCurrentPage(Math.max(0, Math.min(page, totalPages - 1))),
    nextPage: () =>
      setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1)),
    previousPage: () => setCurrentPage((prev) => Math.max(prev - 1, 0)),
  };
};

const DataTable = ({
  entriesPerPage,
  canSearch,
  showTotalEntries,
  table,
  pagination,
  isSorted,
  noEndBorder,
  initialState,
}) => {
  const defaultValue = entriesPerPage.defaultValue || 10;
  const entries = entriesPerPage.entries || [5, 10, 15, 20, 25];

  const columns = useMemo(() => table.columns, [table.columns]);
  const data = useMemo(() => table.rows, [table.rows]);

  const {
    data: pageData,
    allData,
    currentPage,
    pageSize,
    totalPages,
    globalFilter,
    sortBy,
    setCurrentPage,
    setPageSize,
    setGlobalFilter,
    setSortBy,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
  } = useTable(data, columns, {
    initialState: { pageSize: defaultValue, ...initialState },
  });

  const [search, setSearch] = useState(globalFilter);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setGlobalFilter(search);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSort = (columnId) => {
    if (!isSorted) return;

    setSortBy((prev) => {
      const existing = prev.find((s) => s.id === columnId);
      if (existing) {
        return existing.desc ? [] : [{ id: columnId, desc: true }];
      }
      return [{ id: columnId, desc: false }];
    });
  };

  const getSortIcon = (columnId) => {
    const sort = sortBy.find((s) => s.id === columnId);
    if (!sort) return "unfold-more";
    return sort.desc ? "keyboard-arrow-down" : "keyboard-arrow-up";
  };

  // Calculate total table width based on column flex values and minimum widths
  const calculateTableWidth = () => {
    const baseWidth = columns.reduce((total, column) => {
      const minWidth = column.minWidth || 100; // Minimum column width
      const flexWidth = (column.flex || 1) * 80; // Base flex width
      return total + Math.max(minWidth, flexWidth);
    }, 0);

    // Ensure table is at least screen width but can be wider
    return Math.max(baseWidth, screenWidth * 1.5);
  };

  const calculateColumnWidth = (column, totalWidth) => {
    const totalFlex = columns.reduce((sum, col) => sum + (col.flex || 1), 0);
    const flexWidth = (totalWidth * (column.flex || 1)) / totalFlex;
    const minWidth = column.minWidth || 100;
    return Math.max(minWidth, flexWidth);
  };

  const tableWidth = calculateTableWidth();

  const renderHeader = () => (
    <View style={[styles.headerRow, { width: tableWidth }]}>
      {columns.map((column, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.headerCell,
            {
              width: calculateColumnWidth(column, tableWidth),
              alignItems:
                column.align === "center"
                  ? "center"
                  : column.align === "right"
                  ? "flex-end"
                  : "flex-start",
            },
          ]}
          onPress={() => handleSort(column.accessor)}
          disabled={!isSorted}
        >
          <Text
            style={[styles.headerText, { textAlign: column.align || "left" }]}
            numberOfLines={2}
          >
            {typeof column.Header === "string" ? column.Header : column.Header}
          </Text>
          {isSorted && (
            <Icon
              name={getSortIcon(column.accessor)}
              size={14}
              color="#666"
              style={styles.sortIcon}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRows = () => {
    return pageData.map((item, index) => (
      <View
        key={`${item.id || index}-${index}`}
        style={[
          styles.row,
          { width: tableWidth },
          index % 2 === 1 && styles.evenRow,
          index === pageData.length - 1 && noEndBorder && styles.noBottomBorder,
        ]}
      >
        {columns.map((column, colIndex) => (
          <View
            key={colIndex}
            style={[
              styles.cell,
              {
                width: calculateColumnWidth(column, tableWidth),
                alignItems:
                  column.align === "center"
                    ? "center"
                    : column.align === "right"
                    ? "flex-end"
                    : "flex-start",
              },
            ]}
          >
            {column.Cell ? (
              column.Cell({
                value: item[column.accessor],
                row: { original: item },
              })
            ) : (
              <Text
                style={[styles.cellText, { textAlign: column.align || "left" }]}
                numberOfLines={3}
              >
                {item[column.accessor]}
              </Text>
            )}
          </View>
        ))}
      </View>
    ));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisible = 3;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            !canPreviousPage && styles.disabledButton,
          ]}
          onPress={previousPage}
          disabled={!canPreviousPage}
        >
          <Icon
            name="chevron-left"
            size={16}
            color={!canPreviousPage ? "#ccc" : "#1976d2"}
          />
        </TouchableOpacity>

        {pageNumbers.map((pageNum) => (
          <TouchableOpacity
            key={pageNum}
            style={[
              styles.paginationButton,
              currentPage === pageNum && styles.activePaginationButton,
            ]}
            onPress={() => gotoPage(pageNum)}
          >
            <Text
              style={[
                styles.paginationText,
                currentPage === pageNum && styles.activePaginationText,
              ]}
            >
              {pageNum + 1}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.paginationButton,
            !canNextPage && styles.disabledButton,
          ]}
          onPress={nextPage}
          disabled={!canNextPage}
        >
          <Icon
            name="chevron-right"
            size={16}
            color={!canNextPage ? "#ccc" : "#1976d2"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const entriesStart = currentPage === 0 ? 1 : currentPage * pageSize + 1;
  const entriesEnd = Math.min((currentPage + 1) * pageSize, allData.length);

  return (
    <View style={styles.container}>
      {/* Top Controls */}
      {(entriesPerPage || canSearch) && (
        <View style={styles.topControls}>
          {entriesPerPage && (
            <View style={styles.entriesPerPageContainer}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setPickerVisible(!pickerVisible)}
              >
                <Text style={styles.pickerButtonText}>{pageSize}</Text>
                <Icon name="arrow-drop-down" size={16} color="#666" />
              </TouchableOpacity>
              {pickerVisible && (
                <View style={styles.pickerModal}>
                  {entries.map((entry) => (
                    <TouchableOpacity
                      key={entry.toString()}
                      style={styles.pickerOption}
                      onPress={() => {
                        setPageSize(parseInt(entry, 10));
                        setCurrentPage(0);
                        setPickerVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          pageSize === entry && styles.selectedPickerOption,
                        ]}
                      >
                        {entry}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={styles.entriesText}>kayıt</Text>
            </View>
          )}

          {canSearch && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ara..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#999"
              />
              <Icon
                name="search"
                size={16}
                color="#666"
                style={styles.searchIcon}
              />
            </View>
          )}
        </View>
      )}

      {/* Table with Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.horizontalScrollContainer}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        <View style={styles.tableContainer}>
          {renderHeader()}
          <View style={styles.tableBody}>{renderRows()}</View>
        </View>
      </ScrollView>

      {/* Bottom Info and Pagination */}
      <View style={styles.bottomContainer}>
        {showTotalEntries && (
          <View style={styles.totalEntriesContainer}>
            <Text style={styles.totalEntriesText}>
              Toplam {allData.length} kaydın {entriesStart} - {entriesEnd} arası
              gösteriliyor.
            </Text>
          </View>
        )}

        {renderPagination()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  entriesPerPageContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    zIndex: 1000,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    minWidth: 60,
  },
  pickerButtonText: {
    fontSize: 12,
    color: "#333",
    marginRight: 4,
  },
  pickerModal: {
    position: "absolute",
    top: 40,
    left: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1001,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pickerOptionText: {
    fontSize: 12,
    color: "#333",
  },
  selectedPickerOption: {
    color: "#1976d2",
    fontWeight: "600",
  },
  entriesText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 12,
  },
  searchContainer: {
    flex: 1,
    maxWidth: 150,
    marginLeft: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 12,
    color: "#333",
  },
  searchIcon: {
    marginLeft: 8,
  },
  // Horizontal scroll container
  horizontalScrollContainer: {
    flex: 1,
  },
  horizontalScrollContent: {
    // This will be set dynamically based on table width
  },
  tableContainer: {
    backgroundColor: "#fff",
    minWidth: "100%", // Ensures table takes full width of scroll container
  },
  tableBody: {
    // Table body styles
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 2,
    borderBottomColor: "#dee2e6",
    minHeight: 48,
  },
  headerCell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#dee2e6",
  },
  headerText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#495057",
    flex: 1,
  },
  sortIcon: {
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 52,
    backgroundColor: "#ffffff",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  noBottomBorder: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  cellText: {
    fontSize: 9,
    color: "#495057",
    lineHeight: 12,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalEntriesContainer: {
    marginBottom: 12,
  },
  totalEntriesText: {
    fontSize: 11,
    color: "#666",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  paginationButton: {
    minWidth: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
    backgroundColor: "#fff",
  },
  activePaginationButton: {
    backgroundColor: "#1976d2",
    borderColor: "#1976d2",
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 11,
    color: "#495057",
    fontWeight: "500",
  },
  activePaginationText: {
    color: "white",
    fontWeight: "600",
  },
});

DataTable.defaultProps = {
  entriesPerPage: { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  canSearch: false,
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "info" },
  isSorted: true,
  noEndBorder: false,
  initialState: {},
};

DataTable.propTypes = {
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
  initialState: PropTypes.object,
};

export default DataTable;
