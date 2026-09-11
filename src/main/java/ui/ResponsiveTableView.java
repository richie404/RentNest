package ui;

import javafx.scene.control.TableView;

/** Fills wide viewports but retains horizontal scrolling when readable columns cannot fit. */
public class ResponsiveTableView<S> extends TableView<S> {
    public ResponsiveTableView() {
        setMinWidth(0);
        setMinHeight(100);
        widthProperty().addListener(observable -> updateResizePolicy());
        getVisibleLeafColumns().addListener((javafx.beans.InvalidationListener) observable -> updateResizePolicy());
    }

    private void updateResizePolicy() {
        double minimum = getVisibleLeafColumns().stream().mapToDouble(column -> column.getMinWidth()).sum();
        // Reserve room for borders and the vertical scrollbar.
        setColumnResizePolicy(getWidth() >= minimum + 20
                ? TableView.CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN
                : TableView.UNCONSTRAINED_RESIZE_POLICY);
    }
}
